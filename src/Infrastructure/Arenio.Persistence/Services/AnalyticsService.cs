using Arenio.Application.Abstracts.Helpers;
using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.AnalyticsDtos;
using Arenio.Application.Settings;
using Arenio.Domain.Enums;
using Arenio.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Arenio.Persistence.Services
{
    /// <summary>
    /// Analitika servisi. Qaydalar:
    ///  - DB-dəki bütün vaxtlar UTC-dir; gün/ay/saat qruplaması istifadəçiyə
    ///    görünən Bakı təqviminə görə aparılır (DateTimeHelper.ToBaku).
    ///  - FromDate/ToDate Bakı təqvim tarixləridir; yuxarı sərhəd eksklüzivdir
    ///    (seçilmiş günün özü tam daxil olur).
    ///  - Ləğv edilmiş bookinqlər gəlirə heç vaxt daxil edilmir.
    /// </summary>
    public class AnalyticsService : IAnalyticsService
    {
        private const int DefaultMonthsBack = 6;

        private static readonly CultureInfo AzCulture = ResolveAzCulture();

        private readonly ArenioDbContext _context;
        private readonly IBusinessAccessService _businessAccess;

        public AnalyticsService(
            ArenioDbContext context,
            IBusinessAccessService businessAccess)
        {
            _context = context;
            _businessAccess = businessAccess;
        }

        private static CultureInfo ResolveAzCulture()
        {
            try
            {
                return CultureInfo.GetCultureInfo("az");
            }
            catch (CultureNotFoundException)
            {
                return CultureInfo.InvariantCulture;
            }
        }

        /// <summary>Dövrü Bakı təqvimində həll edir: default — son 6 ay (bu ay daxil).</summary>
        private static (DateTime FromBaku, DateTime ToBakuExclusive) ResolvePeriod(
            DateTime? fromDate,
            DateTime? toDate)
        {
            var today = DateTimeHelper.BakuNow.Date;

            var fromBaku = fromDate?.Date
                ?? new DateTime(today.Year, today.Month, 1).AddMonths(-(DefaultMonthsBack - 1));

            var toBakuExclusive = (toDate?.Date ?? today).AddDays(1);

            return (fromBaku, toBakuExclusive);
        }

        private static string MonthKey(DateTime bakuDate)
            => $"{bakuDate.Year:D4}-{bakuDate.Month:D2}";

        private static string MonthLabel(DateTime bakuDate)
            => bakuDate.ToString("MMM yy", AzCulture);

        /// <summary>Ay bucket-lərini sıra ilə qurur (boş aylar 0 ilə görünsün).</summary>
        private static List<(string Key, string Label)> BuildMonthBuckets(
            DateTime fromBaku,
            DateTime toBakuExclusive)
        {
            var buckets = new List<(string, string)>();
            var cursor = new DateTime(fromBaku.Year, fromBaku.Month, 1);
            var last = toBakuExclusive.AddDays(-1);

            while (cursor <= last)
            {
                buckets.Add((MonthKey(cursor), MonthLabel(cursor)));
                cursor = cursor.AddMonths(1);
            }

            return buckets;
        }

        public async Task<BaseResponse<OwnerAnalyticsDto>> GetOwnerAnalyticsAsync(
            DateTime? fromDate,
            DateTime? toDate,
            CancellationToken cancellationToken = default)
        {
            var profileId = await _businessAccess.ResolveOwnerProfileIdAsync();

            if (string.IsNullOrEmpty(profileId))
            {
                return new BaseResponse<OwnerAnalyticsDto>(
                    "Owner profile not found",
                    HttpStatusCode.NotFound);
            }

            var (fromBaku, toBakuExclusive) = ResolvePeriod(fromDate, toDate);

            if (toBakuExclusive <= fromBaku)
            {
                return new BaseResponse<OwnerAnalyticsDto>(
                    "FromDate ToDate-dan böyük ola bilməz.",
                    HttpStatusCode.BadRequest);
            }

            var fromUtc = DateTimeHelper.ToUtc(fromBaku);
            var toUtcExclusive = DateTimeHelper.ToUtc(toBakuExclusive);
            var nowUtc = DateTime.UtcNow;

            var stadiums = await _context.Stadiums
                .AsNoTracking()
                .Where(x => x.StadiumOwnerProfileId == profileId)
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.OpenTime,
                    x.CloseTime,
                    x.AverageRating,
                    x.TotalReviews
                })
                .ToListAsync(cancellationToken);

            // Dövr daxilindəki bookinqlər (qruplaşdırma yaddaşda, Bakı vaxtı ilə aparılır)
            var bookings = await _context.Bookings
                .AsNoTracking()
                .Where(x =>
                    x.Stadium.StadiumOwnerProfileId == profileId &&
                    x.StartDateTime >= fromUtc &&
                    x.StartDateTime < toUtcExclusive)
                .Select(x => new
                {
                    x.StartDateTime,
                    x.EndDateTime,
                    x.TotalPrice,
                    x.Status,
                    StadiumName = x.Stadium.Name
                })
                .ToListAsync(cancellationToken);

            // "Gələcək bronlar" dövrdən asılı olmamalıdır — ayrıca sayılır
            var upcomingBookings = await _context.Bookings
                .AsNoTracking()
                .CountAsync(x =>
                    x.Stadium.StadiumOwnerProfileId == profileId &&
                    x.Status != BookingStatus.Cancelled &&
                    x.StartDateTime > nowUtc,
                    cancellationToken);

            var parsed = bookings
                .Select(x => new
                {
                    x.Status,
                    x.TotalPrice,
                    x.StadiumName,
                    StartBaku = DateTimeHelper.ToBaku(x.StartDateTime),
                    EndBaku = DateTimeHelper.ToBaku(x.EndDateTime)
                })
                .ToList();

            var todayBaku = DateTimeHelper.BakuNow.Date;

            decimal RevenueOf(BookingStatus status, decimal price)
                => status == BookingStatus.Cancelled ? 0 : price;

            // ---- Aylıq seriyalar --------------------------------------------------
            var monthBuckets = BuildMonthBuckets(fromBaku, toBakuExclusive);

            var revenueByMonthMap = new Dictionary<string, decimal>();
            var countByMonthMap = new Dictionary<string, int>();

            foreach (var entry in parsed)
            {
                var key = MonthKey(entry.StartBaku);
                revenueByMonthMap[key] = revenueByMonthMap.GetValueOrDefault(key)
                    + RevenueOf(entry.Status, entry.TotalPrice);
                countByMonthMap[key] = countByMonthMap.GetValueOrDefault(key) + 1;
            }

            var revenueByMonth = monthBuckets
                .Select(b => new TimeSeriesPointDto
                {
                    Label = b.Label,
                    Value = Math.Round(revenueByMonthMap.GetValueOrDefault(b.Key))
                })
                .ToList();

            var bookingsByMonth = monthBuckets
                .Select(b => new TimeSeriesPointDto
                {
                    Label = b.Label,
                    Value = countByMonthMap.GetValueOrDefault(b.Key)
                })
                .ToList();

            // ---- Həftənin günləri (B.e → B) və pik saatlar -----------------------
            var weekdayOrder = new[]
            {
                DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
                DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday,
                DayOfWeek.Sunday
            };

            var bookingsByWeekday = weekdayOrder
                .Select(day => new TimeSeriesPointDto
                {
                    Label = AzCulture.DateTimeFormat.GetAbbreviatedDayName(day),
                    Value = parsed.Count(x => x.StartBaku.DayOfWeek == day)
                })
                .ToList();

            var peakHours = parsed
                .GroupBy(x => x.StartBaku.Hour)
                .OrderBy(g => g.Key)
                .Select(g => new TimeSeriesPointDto
                {
                    Label = $"{g.Key:D2}:00",
                    Value = g.Count()
                })
                .ToList();

            // ---- Stadionlar üzrə gəlir -------------------------------------------
            var revenueByStadium = parsed
                .GroupBy(x => x.StadiumName)
                .Select(g => new TimeSeriesPointDto
                {
                    Label = g.Key,
                    Value = Math.Round(g.Sum(x => RevenueOf(x.Status, x.TotalPrice)))
                })
                .OrderByDescending(x => x.Value)
                .Take(6)
                .ToList();

            // ---- Doluluk: bu Bakı ayının keçmiş günlərinə nisbətən ---------------
            var monthStartBaku = new DateTime(todayBaku.Year, todayBaku.Month, 1);
            var daysSoFar = todayBaku.Day;

            var capacityHours = stadiums.Sum(s =>
            {
                var perDay = (s.CloseTime.ToTimeSpan() - s.OpenTime.ToTimeSpan()).TotalHours;
                if (perDay <= 0) perDay += 24; // gecəyarını keçən qrafik (10:00–02:00)
                return perDay * daysSoFar;
            });

            var bookedHours = parsed
                .Where(x =>
                    x.Status != BookingStatus.Cancelled &&
                    x.StartBaku >= monthStartBaku &&
                    x.StartBaku < todayBaku.AddDays(1))
                .Sum(x => (x.EndBaku - x.StartBaku).TotalHours);

            var occupancyRate = capacityHours > 0
                ? Math.Round(bookedHours / capacityHours * 100, 1)
                : 0;

            // ---- Reytinq ----------------------------------------------------------
            var totalReviews = stadiums.Sum(s => s.TotalReviews);
            var averageRating = totalReviews > 0
                ? Math.Round(
                    stadiums.Sum(s => s.AverageRating * s.TotalReviews) / totalReviews,
                    2)
                : 0;

            var result = new OwnerAnalyticsDto
            {
                Kpis = new OwnerKpisDto
                {
                    TotalBookings = parsed.Count,
                    TodayBookings = parsed.Count(x => x.StartBaku.Date == todayBaku),
                    UpcomingBookings = upcomingBookings,
                    CompletedBookings = parsed.Count(x => x.Status == BookingStatus.Completed),
                    CancelledBookings = parsed.Count(x => x.Status == BookingStatus.Cancelled),
                    RevenueTotal = Math.Round(
                        parsed.Sum(x => RevenueOf(x.Status, x.TotalPrice)),
                        2),
                    RevenueThisMonth = Math.Round(
                        parsed
                            .Where(x => x.StartBaku >= monthStartBaku)
                            .Sum(x => RevenueOf(x.Status, x.TotalPrice)),
                        2),
                    OccupancyRate = occupancyRate,
                    AverageRating = averageRating,
                    TotalReviews = totalReviews
                },
                RevenueByMonth = revenueByMonth,
                BookingsByMonth = bookingsByMonth,
                BookingsByWeekday = bookingsByWeekday,
                PeakHours = peakHours,
                RevenueByStadium = revenueByStadium
            };

            return new BaseResponse<OwnerAnalyticsDto>(
                result,
                "Owner analytics retrieved successfully.",
                HttpStatusCode.OK);
        }

        public async Task<BaseResponse<PlatformAnalyticsDto>> GetPlatformAnalyticsAsync(
            DateTime? fromDate,
            DateTime? toDate,
            CancellationToken cancellationToken = default)
        {
            var (fromBaku, toBakuExclusive) = ResolvePeriod(fromDate, toDate);

            if (toBakuExclusive <= fromBaku)
            {
                return new BaseResponse<PlatformAnalyticsDto>(
                    "FromDate ToDate-dan böyük ola bilməz.",
                    HttpStatusCode.BadRequest);
            }

            var fromUtc = DateTimeHelper.ToUtc(fromBaku);
            var toUtcExclusive = DateTimeHelper.ToUtc(toBakuExclusive);

            // Say göstəriciləri — cari an üzrə
            var totalUsers = await _context.Users
                .CountAsync(cancellationToken);

            var totalOwners = await _context.StadiumOwnerProfiles
                .CountAsync(cancellationToken);

            var publishedStadiums = await _context.Stadiums
                .CountAsync(x =>
                    x.IsActive &&
                    x.VerificationStatus == StadiumVerificationStatus.Verified,
                    cancellationToken);

            var pendingStadiums = await _context.Stadiums
                .CountAsync(x =>
                    x.VerificationStatus == StadiumVerificationStatus.Pending,
                    cancellationToken);

            var pendingOwnerRequests = await _context.OwnerRequests
                .CountAsync(x => x.Status == ApprovalStatus.Pending, cancellationToken);

            // Booking göstəriciləri — seçilmiş dövr üzrə
            var bookings = await _context.Bookings
                .AsNoTracking()
                .Where(x =>
                    x.StartDateTime >= fromUtc &&
                    x.StartDateTime < toUtcExclusive)
                .Select(x => new
                {
                    x.StartDateTime,
                    x.TotalPrice,
                    x.Status
                })
                .ToListAsync(cancellationToken);

            var parsed = bookings
                .Select(x => new
                {
                    x.Status,
                    x.TotalPrice,
                    StartBaku = DateTimeHelper.ToBaku(x.StartDateTime)
                })
                .ToList();

            var monthBuckets = BuildMonthBuckets(fromBaku, toBakuExclusive);

            var revenueByMonthMap = new Dictionary<string, decimal>();
            var countByMonthMap = new Dictionary<string, int>();

            foreach (var entry in parsed)
            {
                var key = MonthKey(entry.StartBaku);
                if (entry.Status != BookingStatus.Cancelled)
                {
                    revenueByMonthMap[key] = revenueByMonthMap.GetValueOrDefault(key)
                        + entry.TotalPrice;
                }
                countByMonthMap[key] = countByMonthMap.GetValueOrDefault(key) + 1;
            }

            var result = new PlatformAnalyticsDto
            {
                Kpis = new PlatformKpisDto
                {
                    TotalUsers = totalUsers,
                    TotalOwners = totalOwners,
                    PublishedStadiums = publishedStadiums,
                    PendingStadiums = pendingStadiums,
                    PendingOwnerRequests = pendingOwnerRequests,
                    TotalBookings = parsed.Count,
                    ConfirmedBookings = parsed.Count(x => x.Status == BookingStatus.Confirmed),
                    CompletedBookings = parsed.Count(x => x.Status == BookingStatus.Completed),
                    CancelledBookings = parsed.Count(x => x.Status == BookingStatus.Cancelled),
                    RevenueTotal = Math.Round(
                        parsed
                            .Where(x => x.Status != BookingStatus.Cancelled)
                            .Sum(x => x.TotalPrice),
                        2)
                },
                BookingsByMonth = monthBuckets
                    .Select(b => new TimeSeriesPointDto
                    {
                        Label = b.Label,
                        Value = countByMonthMap.GetValueOrDefault(b.Key)
                    })
                    .ToList(),
                RevenueByMonth = monthBuckets
                    .Select(b => new TimeSeriesPointDto
                    {
                        Label = b.Label,
                        Value = Math.Round(revenueByMonthMap.GetValueOrDefault(b.Key))
                    })
                    .ToList(),
                BookingsByStatus = new List<TimeSeriesPointDto>
                {
                    new() { Label = "Təsdiqlənib", Value = parsed.Count(x => x.Status == BookingStatus.Confirmed) },
                    new() { Label = "Tamamlanıb", Value = parsed.Count(x => x.Status == BookingStatus.Completed) },
                    new() { Label = "Ləğv edilib", Value = parsed.Count(x => x.Status == BookingStatus.Cancelled) },
                    new() { Label = "Gözləyir (köhnə)", Value = parsed.Count(x => x.Status == BookingStatus.Pending) }
                }
            };

            return new BaseResponse<PlatformAnalyticsDto>(
                result,
                "Platform analytics retrieved successfully.",
                HttpStatusCode.OK);
        }
    }
}
