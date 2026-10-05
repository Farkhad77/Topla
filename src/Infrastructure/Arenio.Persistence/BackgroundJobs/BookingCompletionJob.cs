using Arenio.Domain.Enums;
using Arenio.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.BackgroundJobs
{
    /// <summary>
    /// Vaxtı bitmiş bookinqlərin statusunu avtomatik yeniləyir:
    ///  - Confirmed + EndDateTime keçib  → Completed (oyun baş tutub sayılır);
    ///  - Pending  + EndDateTime keçib  → Cancelled (owner təsdiqi funksiyası
    ///    silinib — köhnə qalıq Pending sətirləri təmizlənir).
    /// Bütün müqayisələr UTC-də aparılır (DB timestamptz saxlayır).
    /// </summary>
    public class BookingCompletionJob : BackgroundService
    {
        private static readonly TimeSpan Interval = TimeSpan.FromMinutes(5);

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<BookingCompletionJob> _logger;

        public BookingCompletionJob(
            IServiceScopeFactory scopeFactory,
            ILogger<BookingCompletionJob> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();

                    var context = scope.ServiceProvider
                        .GetRequiredService<ArenioDbContext>();

                    var nowUtc = DateTime.UtcNow;

                    var completed = await context.Bookings
                        .Where(x =>
                            x.Status == BookingStatus.Confirmed &&
                            x.EndDateTime <= nowUtc)
                        .ExecuteUpdateAsync(
                            s => s.SetProperty(
                                x => x.Status,
                                BookingStatus.Completed),
                            stoppingToken);

                    var cancelled = await context.Bookings
                        .Where(x =>
                            x.Status == BookingStatus.Pending &&
                            x.EndDateTime <= nowUtc)
                        .ExecuteUpdateAsync(
                            s => s.SetProperty(
                                x => x.Status,
                                BookingStatus.Cancelled),
                            stoppingToken);

                    if (completed > 0 || cancelled > 0)
                    {
                        _logger.LogInformation(
                            "BookingCompletionJob: {Completed} booking Completed, {Cancelled} köhnə Pending Cancelled edildi.",
                            completed,
                            cancelled);
                    }
                }
                catch (OperationCanceledException)
                {
                    // Tətbiq dayandırılır — normaldır.
                }
                catch (Exception ex)
                {
                    // Job bir dövrədə yıxılsa belə növbəti dövrədə davam etməlidir.
                    _logger.LogError(ex, "BookingCompletionJob xətası");
                }

                await Task.Delay(Interval, stoppingToken);
            }
        }
    }
}
