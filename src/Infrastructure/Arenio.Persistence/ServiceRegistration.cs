using Arenio.Application.Abstracts.Rabbit;
using Arenio.Application.Abstracts.Repositories;
using Arenio.Application.Abstracts.Services;
using Arenio.Persistence.Abstracts;
using Arenio.Persistence.BackgroundJobs;
using Arenio.Persistence.Rabbit;
using Arenio.Persistence.Repositories;
using Arenio.Persistence.Services;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence
{
    public static class ServiceRegistration
    {
        public static void RegisterService(this IServiceCollection services)
        {
            #region Repositories
           
           services.AddScoped<IStadiumRepository, StadiumRepository>();
           services.AddScoped<IBookingRepository, BookingRepository>();
            services.AddScoped<IStadiumImageRepository, StadiumImageRepository>();
            services.AddScoped<IReviewRepository, ReviewRepository>();

            #endregion
            #region Services
            services.AddScoped < IUserService, UserService>();
            services.AddScoped<IRoleService,  RoleService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IOtpService, OtpService>();
            services.AddScoped<IBookingService, BookingService>();
            services.AddScoped<IAvailabilityService, AvailabilityService>();
            services.AddScoped<IPricingService, PricingService>();
            services.AddScoped<IRedisLockService, RedisLockService>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<IStadiumService, StadiumService>();
            services.AddScoped<IRedisCacheService, RedisCacheService>();
            services.AddScoped<IOwnerRequestService, OwnerRequestService>();
            services.AddScoped<IModeratorService,ModeratorService>();
            services.AddScoped<IReviewService, ReviewService>();
            services.AddScoped<IImageValidator, ImageValidator>();

            services.AddScoped<IFileService, FileService>();

            // DİQQƏT: bu qeydiyyat olmadan StadiumImageController yaradıla bilmir və
            // bütün /api/StadiumImage sorğuları 500 qaytarır.
            services.AddScoped<IStadiumImageService, StadiumImageService>();

            services.AddScoped<IBusinessAccessService, BusinessAccessService>();
            services.AddScoped<IWorkerService, WorkerService>();
            services.AddScoped<IAnalyticsService, AnalyticsService>();


            #endregion
            services.AddSingleton<IRabbitPublisher, RabbitPublisher>();
            services.AddHostedService<OutboxProcessor>();
            services.AddHostedService<BookingCompletionJob>();
            services.AddHostedService<BookingRejectedConsumer>();
            services.AddHostedService<BookingDeletedConsumer>();
            services.AddScoped<IForgotPasswordRateLimiterService, ForgotPasswordRateLimiterService>();
        }
    }
}
