using Arenio.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using Arenio.Persistence;
using Microsoft.OpenApi.Models;
using Arenio.Application.Settings;
using Arenio.Application.Abstracts.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Arenio.Domain.Entities;
using Arenio.Application.Abstracts.Repositories;
using Arenio.Persistence.Repositories;
using StackExchange.Redis;
using Arenio.WebAPI.Middlewares;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using Arenio.Persistence.Seeders;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using FluentValidation;
using Arenio.Application.Validations.BookingValidations;
using Arenio.WebAPI.Filters;
var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile(
    "secrets.json",
    optional: true,
    reloadOnChange: false
);

// Add services to the container.

builder.Services.AddControllers(options =>
{
    // Bütün action argument-ləri üçün FluentValidation-ı avtomatik işə salır
    options.Filters.Add<ValidationFilter>();
});

// FluentValidation validator-larını qeydiyyatdan keçir (Application assembly)
builder.Services.AddValidatorsFromAssemblyContaining<BookingCreateDtoValidator>();

// CORS (production-da AllowAnyOrigin əvəzinə konkret frontend domenini qeyd et)
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCors", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Your API", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' followed by space and your JWT token."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddDbContext<ArenioDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
    options.Lockout.MaxFailedAccessAttempts = 3;
    options.Password.RequireNonAlphanumeric = false;


}).AddEntityFrameworkStores<ArenioDbContext>()
    .AddDefaultTokenProviders();
builder.Services.Configure<JWTSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JWTSettings>();

builder.Services.AddAuthorization(options =>
{
    foreach (var permission in PermissionHelper.GetAllPermissionsList())
    {
        options.AddPolicy(permission, policy =>
        {
            policy.RequireClaim("Permission", permission);
        });
    }
});
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtSettings.SecretKey))
        };
    });
var redisConnectionString = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
var redis = ConnectionMultiplexer.Connect(redisConnectionString);
builder.Services.AddSingleton<IConnectionMultiplexer>(redis);
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.Configure<RabbitMqSettings>(
    builder.Configuration.GetSection("RabbitMQ"));
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");

});
builder.Services.AddSingleton<IConnection>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<RabbitMqSettings>>().Value;

    var factory = new ConnectionFactory
    {
        HostName = settings.Host,
        Port = settings.Port,
        UserName = settings.UserName,
        Password = settings.Password
    };

    return factory.CreateConnection();
});
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("ForgotPasswordPolicy", limiterOptions =>
    {
        limiterOptions.PermitLimit = 3; // maksimum 3 request
        limiterOptions.Window = TimeSpan.FromMinutes(1); // 1 d?qiq?d?
        limiterOptions.QueueLimit = 0;
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });
    options.AddFixedWindowLimiter("ResetPasswordPolicy", limiterOptions =>
    {
        limiterOptions.PermitLimit = 5;
        limiterOptions.Window = TimeSpan.FromMinutes(15);
        limiterOptions.QueueLimit = 0;
    });
    options.AddPolicy("ResendOtpPolicy", context =>
    {
        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 3,
                Window = TimeSpan.FromMinutes(5),
                QueueLimit = 0
            });
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});
builder.Services.Configure<FrontendSettings>(
    builder.Configuration.GetSection("FrontendSettings"));
builder.Services.Configure<StorageSettings>(
    builder.Configuration.GetSection("StorageSettings"));
builder.Services.RegisterService();

var app = builder.Build();

// Prod (Docker) mühitində migration-lar konteyner qalxanda avtomatik tətbiq olunur.
// Dev-də davranış dəyişmir: bayraq yalnız ApplyMigrationsOnStartup=true olduqda işləyir
// (docker-compose environment bölməsində verilir).
if (app.Configuration.GetValue<bool>("ApplyMigrationsOnStartup"))
{
    using var migrationScope = app.Services.CreateScope();

    var dbContext = migrationScope.ServiceProvider
        .GetRequiredService<ArenioDbContext>();

    await dbContext.Database.MigrateAsync();
}


// "Worker" sistem rolunu və permission-larını təmin et
await WorkerRoleSeeder.SeedAsync(app.Services);


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
// Global exception handling – pipeline-ın ən başında olmalıdır
app.UseMiddleware<ExceptionHandlingMiddleware>();

// CORS pipeline-ın erkən mərhələsində olmalıdır: əks halda xəta və 429 cavabları
// CORS başlıqsız qayıdır və brauzer frontend-ə yalnız "Network Error" göstərir.
app.UseCors("DefaultCors");

// Yüklənən stadion şəkilləri {ContentRoot}/Storage qovluğuna yazılır və
// /Storage/... URL-i ilə serve olunur (frontend mediaUrl() və Vite proxy-si
// məhz /Storage yolunu gözləyir). Qovluq yoxdursa yaradılır ki, ilk işə
// salınmada UseStaticFiles exception atmasın.
var storageRoot = Path.Combine(app.Environment.ContentRootPath, "Storage");
Directory.CreateDirectory(storageRoot);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(storageRoot),
    RequestPath = "/Storage"
});

app.UseRateLimiter();

// DİQQƏT — Development-də HTTPS yönləndirməsi QƏSDƏN söndürülüb.
// Səbəb: frontend http://localhost:5077-ə sorğu göndərir, UseHttpsRedirection isə
// onu https://localhost:7171-ə (FƏRQLİ origin) yönləndirir. Brauzer cross-origin
// yönləndirmə zamanı "Authorization" başlığını təhlükəsizlik səbəbindən SİLİR,
// nəticədə backend token görmür və hər səlahiyyətli sorğu 401 qaytarır.
// Prod-da HTTPS reverse proxy səviyyəsində məcbur edilir.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseMiddleware<TokenBlacklistMiddleware>();

app.UseAuthorization();
app.UseMiddleware<UserBlockMiddleware>();
app.MapControllers();
app.Run();
