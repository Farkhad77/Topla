using Arenio.Application.Abstracts.Extensions;
using Arenio.Application.Abstracts.Helpers;
using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.BookingDtos;
using Arenio.Application.Settings;
using Arenio.Domain.Entities;
using Arenio.Domain.Enums;
using Arenio.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Arenio.Persistence.Services
{
    public class BookingService : IBookingService
    {
        private readonly ArenioDbContext _context;
        private readonly IRedisLockService _lockService;
        private readonly IAvailabilityService _availability;
        private readonly IPricingService _pricing;
        private readonly ICurrentUserService _currentUser;
        private readonly IRedisCacheService _redisCacheService;
        private readonly IBusinessAccessService _businessAccess;

        public BookingService(
            ArenioDbContext context,
            IRedisLockService lockService,
            IAvailabilityService availability,
            IPricingService pricing,
            ICurrentUserService currentUser, IRedisCacheService redisCacheService,
            IBusinessAccessService businessAccess)
        {
            _context = context;
            _lockService = lockService;
            _availability = availability;
            _pricing = pricing;
            _currentUser = currentUser;
            _redisCacheService = redisCacheService;
            _businessAccess = businessAccess;
        }
        private async Task RemoveAvailableSlotsCache(Guid stadiumId, DateTime startUtc)
        {
            // Cache açarı istifadəçiyə görünən (Bakı) təqvim gününə görə qurulur —
            // UTC tarixi gecə yarısı ətrafında fərqli günə düşə bilər.
            var bakuDate = DateTimeHelper.ToBakuDate(startUtc);
            var cacheKey = $"available-slots:{stadiumId}:{bakuDate:yyyy-MM-dd}";
            await _redisCacheService.RemoveAsync(cacheKey);
        }

       public async Task<BaseResponse<string?>> CreateBookingAsync(BookingCreateDto dto)
{
    var userId = _currentUser.UserId;

    if (string.IsNullOrEmpty(userId))
        return new BaseResponse<string?>("Unauthorized", HttpStatusCode.Unauthorized);


            // Stadium yoxlanışı
            var stadium = await _context.Stadiums
                .FirstOrDefaultAsync(x => x.Id == dto.StadiumId);

            if (stadium == null)
                return new BaseResponse<string?>(
                    "Stadium not found",
                    HttpStatusCode.NotFound);

            if (!stadium.IsActive)
                return new BaseResponse<string?>(
                    "Stadium is not active",
                    HttpStatusCode.BadRequest);

            // Müddət yoxlaması (validator işləmirsə belə servis səviyyəsində qorunmalıdır)
            if (dto.DurationMinutes <= 0)
                return new BaseResponse<string?>(
                    "Invalid booking duration.",
                    HttpStatusCode.BadRequest);

            if (dto.DurationMinutes < stadium.MinBookingMinutes ||
                (stadium.MaxBookingMinutes > 0 && dto.DurationMinutes > stadium.MaxBookingMinutes))
                return new BaseResponse<string?>(
                    $"Booking duration must be between {stadium.MinBookingMinutes} and {stadium.MaxBookingMinutes} minutes.",
                    HttpStatusCode.BadRequest);

            // Frontend Bakı divar saatını göndərir ("2026-08-21T18:00:00").
            // DB və bütün müqayisələr UTC-də aparılır: 18:00 Bakı → 14:00 UTC.
            var startUtc = DateTimeHelper.ToUtc(dto.StartDateTime);
            var endUtc = startUtc.AddMinutes(dto.DurationMinutes);

            // Keçmiş tarixə booking olmaz (UTC-də müqayisə)
            if (startUtc <= DateTime.UtcNow)
                return new BaseResponse<string?>(
                    "Booking cannot be created in the past.",
                    HttpStatusCode.BadRequest);

            // İş saatları stadionun YERLİ (Bakı) saatlarıdır — pəncərə Bakı divar
            // saatında qurulur və müqayisə də Bakı divar saatında aparılır.
            var startBaku = DateTimeHelper.ToBaku(startUtc);
            var endBaku = startBaku.AddMinutes(dto.DurationMinutes);

            // Booking başlanğıcı MinBookingMinutes intervalına uyğun olmalıdır
            if (startBaku.Minute % stadium.MinBookingMinutes != 0 ||
                startBaku.Second != 0)
            {
                return new BaseResponse<string?>(
                    $"Booking yalnız {stadium.MinBookingMinutes} dəqiqəlik intervallarda başlaya bilər.",
                    HttpStatusCode.BadRequest);
            }

            // Pəncərə gecə yarısını keçə bilər (məs. 10:00 – 02:00), ona görə
            // TimeOnly müqayisəsi yox, tam DateTime pəncərəsi istifadə olunur.
            var workStart = startBaku.Date.Add(stadium.OpenTime.ToTimeSpan());
            var workEnd = startBaku.Date.Add(stadium.CloseTime.ToTimeSpan());

            if (workEnd <= workStart)
                workEnd = workEnd.AddDays(1);

            // Gecə yarısından sonra başlayan bron (məs. 00:30) əvvəlki günün
            // iş pəncərəsinə aiddir — pəncərəni bir gün geri sürüşdürürük.
            if (startBaku < workStart)
            {
                workStart = workStart.AddDays(-1);
                workEnd = workEnd.AddDays(-1);
            }

            if (startBaku < workStart || endBaku > workEnd)
                return new BaseResponse<string?>(
                    "Booking time is outside the stadium's working hours.",
                    HttpStatusCode.BadRequest);

    // Lock açarı Bakı divar saatına görə formalaşır (istifadəçinin seçdiyi slot).
    var lockKey = $"lock:stadium:{dto.StadiumId}:{startBaku:yyyyMMddHHmm}";

    var lockToken = await _lockService.AcquireLockAsync(lockKey, TimeSpan.FromSeconds(30));

    if (lockToken is null)
        return new BaseResponse<string?>("Slot is busy", HttpStatusCode.Conflict);

    try
    {
        // 1. Mövcudluğu yoxlayırıq (Artıq BookingService içində əlavə AnyAsync yazmırıq)
        //    DB-dəki bütün dəyərlər UTC olduğu üçün müqayisə də UTC-də aparılır.
        var availableResponse = await _availability.IsAvailableAsync(
            dto.StadiumId, startUtc, endUtc);

        if (!availableResponse.Success || availableResponse.Data == false)
            return new BaseResponse<string?>("Not available", HttpStatusCode.BadRequest);

        var price = await _pricing.CalculateAsync(
            dto.StadiumId,
            startUtc,
            endUtc);

        // 2. Transaction-ı başladırıq
        using var tx = await _context.Database.BeginTransactionAsync();

        var booking = new Booking
        {
            StadiumId = dto.StadiumId,
            UserId = userId,
            StartDateTime = startUtc,
            EndDateTime = endUtc,
            TotalPrice = price,
            // Owner təsdiqi silinib — slot boşdursa booking dərhal təsdiqlənmiş sayılır.
            Status = BookingStatus.Confirmed
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        await tx.CommitAsync();

                // 3. Cache təmizlənməsi
                await RemoveAvailableSlotsCache(
              booking.StadiumId,
              booking.StartDateTime); // DateTime olaraq ötürülür

                return new BaseResponse<string?>(
            booking.Id.ToString(),
            "Booking created",
            HttpStatusCode.Created);
    }
    finally
    {
        await _lockService.ReleaseLockAsync(lockKey, lockToken!);
    }
}

        public async Task<BaseResponse<bool>> CancelBookingAsync(Guid id) //oz bookingi otmena elemek
        {
            var userId = _currentUser.UserId;

            if (string.IsNullOrEmpty(userId))
                return new BaseResponse<bool>(
                    "Unauthorized",
                    HttpStatusCode.Unauthorized);

            var booking = await _context.Bookings
                .FirstOrDefaultAsync(x => x.Id == id);

            if (booking == null)
                return new BaseResponse<bool>(
                    "Booking not found",
                    HttpStatusCode.NotFound);

            if (booking.UserId != userId)
                return new BaseResponse<bool>(
                    "You cannot cancel this booking",
                    HttpStatusCode.Forbidden);

            if (booking.Status == BookingStatus.Cancelled)
                return new BaseResponse<bool>(
                    "Booking is already cancelled",
                    HttpStatusCode.BadRequest);

            // Oyunun başlamasına 6 saatdən az qalıbsa ləğv etmək olmaz
            if (booking.StartDateTime <= DateTime.UtcNow.AddHours(6))
                return new BaseResponse<bool>(
                    "Bookings cannot be cancelled within 6 hours of the start time.",
                    HttpStatusCode.BadRequest);

            booking.Status = BookingStatus.Cancelled;

            await _context.SaveChangesAsync();

            await RemoveAvailableSlotsCache(
                booking.StadiumId,
                booking.StartDateTime);

            return new BaseResponse<bool>(
                "Cancelled",
                true,
                HttpStatusCode.OK);
        }

        public async Task<BaseResponse<List<BookingDto>>> GetUserBookingsAsync(string userId)
        {
            var data = await _context.Bookings
                .Where(x => x.UserId == userId)
                .Select(x => new BookingDto
                {
                    Id = x.Id,
                    StadiumId = x.StadiumId,
                    StartDateTime = x.StartDateTime,
                    EndDateTime = x.EndDateTime,
                    Status = x.Status
                })
                .ToListAsync();

            return new BaseResponse<List<BookingDto>>(
                data,
                "Success",
                HttpStatusCode.OK
            );
        }

        public async Task<BaseResponse<BookingDto?>> GetByIdAsync(Guid id)
        {
            var data = await _context.Bookings
                .Where(x => x.Id == id)
                .Select(x => new BookingDto
                {
                    Id = x.Id,
                    StadiumId = x.StadiumId,
                    StartDateTime = x.StartDateTime,
                    EndDateTime = x.EndDateTime,
                    Status = x.Status
                })
                .FirstOrDefaultAsync();

            if (data == null)
                return new BaseResponse<BookingDto?>("Not found", HttpStatusCode.NotFound);

            return new BaseResponse<BookingDto?>(
                data,
                "Success",
                HttpStatusCode.OK
            );
        }
        public async Task<BaseResponse<List<BookingGetMyDto>>> GetMyBookingsAsync()
        {
            var userId = _currentUser.UserId;

            if (string.IsNullOrEmpty(userId))
                return new BaseResponse<List<BookingGetMyDto>>(
                    "Unauthorized",
                    HttpStatusCode.Unauthorized);

            var data = await _context.Bookings
                .Where(x => x.UserId == userId)
                .Select(x => new BookingGetMyDto
                {
                    Id = x.Id,
                    StadiumId = x.StadiumId,
                    StadiumName = x.Stadium.Name,
                    StartDateTime = x.StartDateTime,
                    EndDateTime = x.EndDateTime,
                    TotalPrice = x.TotalPrice,
                    Status = x.Status
                })
                .ToListAsync();

            return new BaseResponse<List<BookingGetMyDto>>(
                data,
                "Success",
                HttpStatusCode.OK);
        }
        public async Task<PagedResult<BookingDto>> GetAllBookingsAsync(
    PaginationRequest request,
    CancellationToken cancellationToken)
        {
            var query = _context.Bookings
                .AsNoTracking();

            return await query
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new BookingDto
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    StadiumId = x.StadiumId,
                    StadiumName = x.Stadium.Name,
                    StartDateTime = x.StartDateTime,
                    EndDateTime = x.EndDateTime,
                    TotalPrice = x.TotalPrice,
                    Status = x.Status
                })
                .ToPagedResultAsync(request, cancellationToken);
        }
        public async Task<BaseResponse<string?>> DeleteBookingAsync(Guid bookingId) //admin ucun
        {
            var booking = await _context.Bookings
                .Include(x => x.User)
                .Include(x => x.Stadium)
                .FirstOrDefaultAsync(x => x.Id == bookingId);

            if (booking == null)
            {
                return new BaseResponse<string?>(
                    "Booking not found.",
                    HttpStatusCode.NotFound);
            }

            var @event = new BookingDeletedEventDto
            {
                BookingId = booking.Id,
                Email = booking.User.Email!,
                UserName = booking.User.FullName,
                StadiumName = booking.Stadium.Name,
                // E-poçtda istifadəçiyə görünən vaxt — Bakı
                BookingDate = DateTimeHelper.ToBaku(booking.StartDateTime)
            };

            _context.OutboxMessages.Add(new OutboxMessage
            {
                Id = Guid.NewGuid(),
                Type = nameof(BookingDeletedEventDto),
                Payload = JsonSerializer.Serialize(@event),
                CreatedAt = DateTime.UtcNow,
                Processed = false
            });

            var stadiumId = booking.StadiumId;
            var date = booking.StartDateTime;

            _context.Bookings.Remove(booking);

            await _context.SaveChangesAsync();

            await RemoveAvailableSlotsCache(stadiumId, date);

            return new BaseResponse<string?>(
                null,
                "Booking deleted successfully.",
                HttpStatusCode.OK);
        }
        /*public async Task<BaseResponse<string?>> DeleteMyBookingAsync(Guid bookingId)
        {
            var userId = _currentUser.UserId;

            if (string.IsNullOrEmpty(userId))
            {
                return new BaseResponse<string?>(
                    "Unauthorized",
                    HttpStatusCode.Unauthorized);
            }

            var booking = await _context.Bookings
                .FirstOrDefaultAsync(x =>
                    x.Id == bookingId &&
                    x.UserId == userId);

            if (booking == null)
            {
                return new BaseResponse<string?>(
                    "Booking not found.",
                    HttpStatusCode.NotFound);
            }

            _context.Bookings.Remove(booking);

            await _context.SaveChangesAsync();

            return new BaseResponse<string?>(
                null,
                "Booking deleted successfully.",
                HttpStatusCode.OK);
        }*/ //bu servis artiq cancel bookingde var
        public async Task<BaseResponse<string?>> RejectBookingAsync(Guid bookingId, BookingRejectDto dto) //owner ucun
        {
            var userId = _currentUser.UserId;

            if (string.IsNullOrEmpty(userId))
            {
                return new BaseResponse<string?>("Unauthorized", HttpStatusCode.Unauthorized);
            }

            var booking = await _context.Bookings
                .Include(x => x.User)
                .Include(x => x.Stadium)
                    .ThenInclude(x => x.StadiumOwnerProfile)
                .FirstOrDefaultAsync(x => x.Id == bookingId);

            if (booking == null)
            {
                return new BaseResponse<string?>("Booking not found.", HttpStatusCode.NotFound);
            }

            if (!await _businessAccess.CanManageStadiumAsync(booking.StadiumId))
            {
                return new BaseResponse<string?>("You are not allowed to manage this stadium.", HttpStatusCode.Forbidden);
            }

            // Transaction-ı burada açırıq
            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                booking.Status = BookingStatus.Cancelled;

                var @event = new BookingRejectedEventDto
                {
                    BookingId = booking.Id,
                    Email = booking.User.Email!,
                    UserName = booking.User.FullName,
                    StadiumName = booking.Stadium.Name,
                    RejectReason = dto.RejectReason,
                    // E-poçtda istifadəçiyə görünən vaxt — Bakı
                    BookingDate = DateTimeHelper.ToBaku(booking.StartDateTime)
                };

                _context.OutboxMessages.Add(new OutboxMessage
                {
                    Id = Guid.NewGuid(),
                    Type = nameof(BookingRejectedEventDto),
                    Payload = JsonSerializer.Serialize(@event),
                    CreatedAt = DateTime.UtcNow,
                    Processed = false
                });

                await _context.SaveChangesAsync();
                await tx.CommitAsync(); // Hər şey uğurludursa commit edirik
                await RemoveAvailableSlotsCache(
                    booking.StadiumId,
                    booking.StartDateTime); // DateTime olaraq ötürülür

                return new BaseResponse<string?>(null, "Booking rejected successfully.", HttpStatusCode.OK);
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }
        public async Task<BaseResponse<List<BookingAvailableSlotsDto>>> GetAvailableSlotsAsync(
    Guid stadiumId,
    DateOnly date)
        {
            var stadium = await _context.Stadiums
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == stadiumId);

            if (stadium == null)
            {
                return new BaseResponse<List<BookingAvailableSlotsDto>>(
                    "Stadium not found.",
                    HttpStatusCode.NotFound);
            }

            // `date` Bakı təqvim günüdür, OpenTime/CloseTime isə stadionun YERLİ (Bakı)
            // iş saatlarıdır. Pəncərə əvvəlcə Bakı divar saatında qurulur.
            // Gecə yarısını keçirsə (məs. 10:00 – 02:00) bağlanış NÖVBƏTİ günə düşür —
            // əks halda `current < close` heç vaxt doğru olmur və slot siyahısı boş qayıdır.
            var windowStartBaku = date.ToDateTime(stadium.OpenTime);
            var windowEndBaku = date.ToDateTime(stadium.CloseTime);

            if (windowEndBaku <= windowStartBaku)
                windowEndBaku = windowEndBaku.AddDays(1);

            // DB sorğuları üçün Bakı → UTC (18:00 Bakı = 14:00 UTC).
            var windowStart = DateTimeHelper.ToUtc(windowStartBaku);
            var windowEnd = DateTimeHelper.ToUtc(windowEndBaku);

            // Bronlar tarixə görə deyil, pəncərə ilə KƏSİŞMƏYƏ görə seçilir:
            // gecə yarısından sonrakı slotlar (00:00–02:00) növbəti tarixdə saxlanılır.
            var bookings = await _context.Bookings
                .AsNoTracking()
                .Where(x =>
                    x.StadiumId == stadiumId &&
                    x.Status != BookingStatus.Cancelled &&
                    x.StartDateTime < windowEnd &&
                    x.EndDateTime > windowStart)
                .ToListAsync();

            // Owner tərəfindən bloklanmış slot-lar da "boş deyil" sayılmalıdır
            var blockedSlots = await _context.StadiumBlockedSlots
                .AsNoTracking()
                .Where(x =>
                    x.StadiumId == stadiumId &&
                    x.StartTime < windowEnd &&
                    x.EndTime > windowStart)
                .ToListAsync();

            var slots = new List<BookingAvailableSlotsDto>();

            var current = windowStart;
            var close = windowEnd;

            while (current < close)
            {
                var end = current.AddHours(1);

                var hasConflict = bookings.Any(x =>
                    x.StartDateTime < end &&
                    x.EndDateTime > current)
                    || blockedSlots.Any(x =>
                    x.StartTime < end &&
                    x.EndTime > current);

                slots.Add(new BookingAvailableSlotsDto
                {
                    StartTime = current,
                    EndTime = end,
                    IsAvailable = !hasConflict
                });

                current = end;
            }

            return new BaseResponse<List<BookingAvailableSlotsDto>>(
                slots,
                "Available slots",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<BookingPreviewDto>> PreviewAsync(
    BookingPreviewRequestDto dto)
        {
            var stadium = await _context.Stadiums
                .FirstOrDefaultAsync(x => x.Id == dto.StadiumId);

            if (stadium == null)
            {
                return new BaseResponse<BookingPreviewDto>(
                    "Stadium not found",
                    HttpStatusCode.NotFound);
            }

            // Frontend Bakı divar saatı göndərir — DB müqayisələri üçün UTC-yə çevrilir.
            var startUtc = DateTimeHelper.ToUtc(dto.StartDateTime);
            var endUtc = startUtc.AddMinutes(dto.DurationMinutes);

            var availableResponse = await _availability.IsAvailableAsync(
                dto.StadiumId,
                startUtc,
                endUtc);

            if (!availableResponse.Success || availableResponse.Data == false)
            {
                return new BaseResponse<BookingPreviewDto>(
                    "Selected time is not available",
                    HttpStatusCode.Conflict);
            }

            var price = await _pricing.CalculateAsync(
                dto.StadiumId,
                startUtc,
                endUtc);

            // Cavabda istifadəçiyə görünən (Bakı) divar saatı qaytarılır.
            var startBaku = DateTimeHelper.ToBaku(startUtc);

            var result = new BookingPreviewDto
            {
                StadiumId = stadium.Id,
                StadiumName = stadium.Name,
                StartDateTime = startBaku,
                EndDateTime = startBaku.AddMinutes(dto.DurationMinutes),
                DurationMinutes = dto.DurationMinutes,
                PricePerHour = stadium.PricePerHour,
                TotalPrice = price,
                IsAvailable = true
            };
            return new BaseResponse<BookingPreviewDto>(
                result,
                "Preview calculated successfully",
                HttpStatusCode.OK);
        }

    }
}