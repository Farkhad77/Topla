using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.UserDtos;
using Arenio.Application.Settings;
using Arenio.Domain.Entities;
using Arenio.Persistence.Contexts;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using StackExchange.Redis;
using IDatabase = StackExchange.Redis.IDatabase;
using Arenio.Application.Abstracts.Helpers;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;
namespace Arenio.Persistence.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly JWTSettings _jwtSetting;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IRoleService _roleService;
        private readonly ArenioDbContext _context;
        private readonly IOtpService _otpService;
        private readonly IDatabase _db;
        private readonly IConnectionMultiplexer _redisConnection;
        private readonly IForgotPasswordRateLimiterService _forgotPasswordRateLimiterService;
        private readonly IEmailService _emailService;
        private readonly FrontendSettings _frontendSettings;
        private readonly IPasswordHasher<User> _passwordHasher;

        public UserService(UserManager<User> userManager, SignInManager<User> signInManager,
            IOptions<JWTSettings> jwtSetting,
            RoleManager<IdentityRole> roleManager, IRoleService roleService,
            ArenioDbContext context,
            IOtpService otpService, IConnectionMultiplexer redisConnection, 
            IForgotPasswordRateLimiterService forgotPasswordRateLimiterService, IEmailService emailService,
IOptions<FrontendSettings> frontendSettings, IPasswordHasher<User> passwordHasher)
            
            
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtSetting = jwtSetting.Value;
            _roleManager = roleManager;
            _roleService = roleService;
            _context = context;
            _otpService = otpService;
            _redisConnection = redisConnection;
            _db = _redisConnection.GetDatabase();
            _forgotPasswordRateLimiterService = forgotPasswordRateLimiterService;
            _emailService = emailService;
            _frontendSettings = frontendSettings.Value;
            _passwordHasher = passwordHasher;
        }
        public async Task<BaseResponse<PagedResult<UserDto>>> GetAllAsync(int pageNumber = 1, int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var query = _userManager.Users;

            var totalRecords = await query.CountAsync();

            var users = await query
                .OrderBy(u => u.UserName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    
                    FullName = u.FullName,
                    Email = u.Email,
                 
                    LastLoginDate = u.LastLoginDate
                })
                .ToListAsync();

            if (!users.Any())
                return new BaseResponse<PagedResult<UserDto>>("No users found", HttpStatusCode.NotFound);

            var pagedResponse = new PagedResult<UserDto>(users, totalRecords, pageNumber, pageSize);

            return new BaseResponse<PagedResult<UserDto>>(pagedResponse, "Users retrieved successfully", HttpStatusCode.OK);
        }

        public async Task<BaseResponse<UserDto>> GetByIdAsync(string id)
        {
            var user = await _userManager.Users
                .Where(u => u.Id == id)
                .Select(u => new UserDto
                {
                    Id = u.Id,                  
                    FullName = u.FullName,
                    Email = u.Email,
                    
                    LastLoginDate = u.LastLoginDate
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return new BaseResponse<UserDto>("User not found", HttpStatusCode.NotFound);

            return new BaseResponse<UserDto>(user, "User retrieved successfully", HttpStatusCode.OK);
        }
        public async Task<BaseResponse<string>> DeleteAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
                return new BaseResponse<string>("User not found", HttpStatusCode.NotFound);

            var result = await _userManager.DeleteAsync(user);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return new BaseResponse<string>($"Failed to delete user: {errors}", HttpStatusCode.BadRequest);
            }

            return new BaseResponse<string>("User deleted successfully", HttpStatusCode.OK);
        }

        public async Task<BaseResponse<string>> RegisterAsync(UserRegisterDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();

            // Email artıq mövcuddur?
            var existingEmail = await _userManager.FindByEmailAsync(email);

            if (existingEmail != null)
            {
                return new BaseResponse<string>(
                    "This account already exists.",
                    HttpStatusCode.BadRequest);
            }

            // Phone artıq mövcuddur?
            var existingPhone = await _userManager.Users
                .AnyAsync(x => x.PhoneNumber == dto.PhoneNumber);

            if (existingPhone)
            {
                return new BaseResponse<string>(
                    "This phone number is already registered.",
                    HttpStatusCode.BadRequest);
            }

            // Password hash
            var passwordHash = _passwordHasher.HashPassword(
                null!,
                dto.Password);

            // Pending registration
            var pendingUser = new PendingUserDto
            {
                FullName = dto.FullName,
                Email = email,
                PhoneNumber = dto.PhoneNumber,
                PasswordHash = passwordHash
            };

            var jsonData = JsonSerializer.Serialize(pendingUser);

            var redisKey = $"auth:pending-user:{email}";

            await _db.StringSetAsync(
                redisKey,
                jsonData,
                TimeSpan.FromMinutes(10));

            // OTP generate + send
            await _otpService.GenerateOtpByEmailAsync(email);

            return new BaseResponse<string>(
                "OTP sent to your email. Please confirm.",
                HttpStatusCode.OK);
        }

        public async Task<BaseResponse<TokenResponse>> ConfirmRegisterOtpAsync(
   UserConfirmRegisterOtpDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();

            // 1. Pending registration Redis-dən götürülür
            var redisKey = $"auth:pending-user:{email}";

            var redisData = await _db.StringGetAsync(redisKey);

            if (redisData.IsNullOrEmpty)
            {
                return new BaseResponse<TokenResponse>(
                    "Registration session expired. Please register again.",
                    HttpStatusCode.BadRequest);
            }

            // 2. Pending user deserialize edilir
            var pendingUser =
                JsonSerializer.Deserialize<PendingUserDto>(
                    redisData!);

            if (pendingUser == null)
            {
                return new BaseResponse<TokenResponse>(
                    "Invalid registration data.",
                    HttpStatusCode.BadRequest);
            }

            // 3. OTP yoxlanılır
            var otpResult = await _otpService.VerifyOtpByEmailAsync(
                email,
                dto.Otp);

            if (!otpResult)
            {
                return new BaseResponse<TokenResponse>(
                    "Invalid or expired OTP.",
                    HttpStatusCode.BadRequest);
            }

            // 4. Təhlükəsizlik üçün DB-də yenidən yoxla
            var existingEmail = await _userManager.FindByEmailAsync(email);

            if (existingEmail != null)
            {
                await _db.KeyDeleteAsync(redisKey);

                return new BaseResponse<TokenResponse>(
                    "This account already exists.",
                    HttpStatusCode.BadRequest);
            }

            // 5. Phone da yenidən yoxlanılır
            var existingPhone = await _userManager.Users
                .AnyAsync(x =>
                    x.PhoneNumber == pendingUser.PhoneNumber);

            if (existingPhone)
            {
                await _db.KeyDeleteAsync(redisKey);

                return new BaseResponse<TokenResponse>(
                    "This phone number is already registered.",
                    HttpStatusCode.BadRequest);
            }

            // 6. User yaradılır
            var user = new User
            {
                UserName = pendingUser.Email,
                Email = pendingUser.Email,
                PhoneNumber = pendingUser.PhoneNumber,
                FullName = pendingUser.FullName,
                PasswordHash = pendingUser.PasswordHash,

                // OTP təsdiqləndiyi üçün
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user);

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    result.Errors.Select(x => x.Description));

                return new BaseResponse<TokenResponse>(
                    errors,
                    HttpStatusCode.BadRequest);
            }

            // 7. Role assign
            await _userManager.AddToRoleAsync(user, "User");

            // 8. Pending registration artıq lazım deyil
            await _db.KeyDeleteAsync(redisKey);

            // 9. JWT yarat
            var token = await GenerateTokensAsync(user);
            return new BaseResponse<TokenResponse>(
                token,
                "Registration completed successfully.",
                HttpStatusCode.OK);
        }


        public async Task<BaseResponse<TokenResponse>> Login(UserLoginDto dto)
        {
            var existedEmail = await _userManager.FindByEmailAsync(dto.Email);
            if (existedEmail is null)
            {
                return new("Email or password is wrong.", HttpStatusCode.NotFound);
            }

            if (!existedEmail.EmailConfirmed)
            {
                return new("Please confirm your email before logging in.", HttpStatusCode.BadRequest);
            }

            if (existedEmail.IsBlocked)
            {
                return new(
                    $"Your account has been blocked. ",
                    HttpStatusCode.Forbidden);
            }

            // lockoutOnFailure: true → uğursuz cəhdlər sayılır, hədd keçiləndə hesab müvəqqəti kilidlənir
            var signInResult = await _signInManager.CheckPasswordSignInAsync(
                existedEmail,
                dto.Password,
                lockoutOnFailure: true);

            if (signInResult.IsLockedOut)
            {
                return new(
                    "Account temporarily locked due to multiple failed login attempts. Please try again later.",
                    HttpStatusCode.Forbidden);
            }

            if (!signInResult.Succeeded)
            {
                return new("Email or password is wrong.", HttpStatusCode.BadRequest);
            }

            existedEmail.LastLoginDate = DateTime.UtcNow;
            await _userManager.UpdateAsync(existedEmail);

            var token = await GenerateTokensAsync(existedEmail);

            return new BaseResponse<TokenResponse>(
                token,
                "Token generated successfully",
                HttpStatusCode.OK);
        }
        private async Task<TokenResponse> GenerateTokensAsync(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSetting.SecretKey);


            var userRoles = await _userManager.GetRolesAsync(user);
            var securityStamp = await _userManager.GetSecurityStampAsync(user);

            var claims = new List<Claim>
    {
        new Claim(ClaimTypes.Email, user.Email!),
        new Claim("security_stamp", securityStamp),

        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };


           

            foreach (var roleName in userRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, roleName));

                var role = await _roleManager.FindByNameAsync(roleName);

                if (role == null)
                    continue;

                var roleClaims = await _roleManager.GetClaimsAsync(role);

                foreach (var claim in roleClaims.Where(c => c.Type == "Permission"))
                {
                    claims.Add(claim);
                }
            }


            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSetting.ExpiryMinutes),
                Issuer = _jwtSetting.Issuer,
                Audience = _jwtSetting.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };


            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwt = tokenHandler.WriteToken(token);

            var refreshToken = GenerateRefreshToken();
            var refreshTokenExpiryDate = DateTime.UtcNow.AddHours(2);

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryDate = refreshTokenExpiryDate;
            await _userManager.UpdateAsync(user);

            return new TokenResponse
            {
                Token = jwt,
                RefreshToken = refreshToken,
                ExpireDate = tokenDescriptor.Expires!.Value
            };
        }
        private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = false,
                ValidIssuer = _jwtSetting.Issuer,
                ValidAudience = _jwtSetting.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSetting.SecretKey))
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

                if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                    !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                    return null;

                return principal;
            }
            catch
            {
                return null;
            }
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }


        public async Task<BaseResponse<TokenResponse>> RefreshTokenAsync(RefreshTokenRequest request)
        {
            var principal = GetPrincipalFromExpiredToken(request.AccessToken);
            if (principal == null)
                return new("Invalid access token",  HttpStatusCode.Unauthorized);

            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userManager.FindByIdAsync(userId!);

            if (user == null)
                return new("User not found",  HttpStatusCode.NotFound);


            if (user.RefreshToken is null || user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiryDate < DateTime.UtcNow)
                return new("Invalid refresh token",  HttpStatusCode.BadRequest);


            var newAccessToken = await GenerateTokensAsync(user);

            return new BaseResponse<TokenResponse>(
                newAccessToken,
                "Token refreshed",
                HttpStatusCode.OK
            );
        }


        public async Task<BaseResponse<string?>> ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var allowed = await _forgotPasswordRateLimiterService.IsAllowedAsync(dto.Email);

            if (!allowed)
            {
                return new BaseResponse<string?>(
                    "Çox sayda sorğu göndərilib. Zəhmət olmasa 10 dəqiqə sonra yenidən cəhd edin.",
                    HttpStatusCode.TooManyRequests);
            }

            var user = await _userManager.FindByEmailAsync(dto.Email);

            if (user == null)
            {
                return new BaseResponse<string?>(
                    "Əgər bu email ilə hesab mövcuddursa, şifrə sıfırlama linki göndərildi.",
                    true,
                    HttpStatusCode.OK);
            }
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(
            Encoding.UTF8.GetBytes(token));
            var resetLink =
            $"{_frontendSettings.ResetPasswordUrl}" +
            $"?userId={user.Id}" +
            $"&token={encodedToken}";
            // DİQQƏT: bir çox poçt müştərisi <head><style> blokunu silir —
            // düymənin stili inline verilməlidir ki, hər yerdə düzgün görünsün.
            var body = $@"
<html>
<body style='font-family: Arial, sans-serif;'>

<h2>Arenio Password Reset</h2>

<p>Hello {user.UserName},</p>

<p>
You requested to reset your password.
Click the button below to continue.
</p>

<p>
    <a href='{resetLink}'
       style='display: inline-block; padding: 12px 20px; background-color: #2563eb;
              color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;'>
        Reset Password
    </a>
</p>

<p>
If you didn't request this, you can safely ignore this email.
</p>

<p>
This link will expire according to the ASP.NET Identity token lifetime.
</p>

</body>
</html>";
            await _emailService.SendEmailAsync(
            user.Email!,
            "Reset your Arenio password",
            body,
            true);
            return new BaseResponse<string?>(
            null,
            "Password reset link has been sent to your email.",
            HttpStatusCode.OK);

        }

        public async Task<BaseResponse<string?>> ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _userManager.FindByIdAsync(dto.UserId);

            if (user == null)
            {
                return new BaseResponse<string?>(
                    "User not found.",
                    HttpStatusCode.NotFound);
            }
            string decodedToken;

            try
            {
                decodedToken = Encoding.UTF8.GetString(
                    WebEncoders.Base64UrlDecode(dto.Token));
            }
            catch
            {
                return new BaseResponse<string?>(
                    "Invalid reset token.",
                    HttpStatusCode.BadRequest);
            }

            var result = await _userManager.ResetPasswordAsync(
                user,
                decodedToken,
                dto.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join(
                    Environment.NewLine,
                    result.Errors.Select(x => x.Description));

                return new BaseResponse<string?>(
                    errors,
                    HttpStatusCode.BadRequest);
            }

            // Şifrə dəyişən kimi köhnə sessiyaların davamı mümkün olmasın:
            // refresh token ləğv edilir, security stamp yenilənir (mövcud
            // access tokenlər TokenBlacklistMiddleware-dəki stamp yoxlaması ilə düşür).
            user.RefreshToken = null;
            user.RefreshTokenExpiryDate = null;

            await _userManager.UpdateSecurityStampAsync(user);
            return new BaseResponse<string?>(
            null,
            "Password has been reset successfully.",
            HttpStatusCode.OK);
            

        }


    }
}

