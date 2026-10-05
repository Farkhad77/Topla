using Arenio.Application.Abstracts.Extensions;
using Arenio.Application.Abstracts.Helpers;
using Arenio.Application.Abstracts.Repositories;
using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.BookingDtos;
using Arenio.Application.DTOs.StadiumBlockedSlotDtos;
using Arenio.Application.DTOs.StadiumDtos;
using Arenio.Application.Settings;
using Arenio.Domain.Entities;
using Arenio.Domain.Enums;
using Arenio.Domain.Models;
using Arenio.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Services
{
    public class StadiumService : IStadiumService
    {
        private readonly ICurrentUserService _currentUser;
        private readonly ArenioDbContext _context;
        private readonly IStadiumRepository _stadiumRepository;
        private readonly IRedisCacheService _redisCacheService;
        private readonly IRepository<StadiumBlockedSlot> _blockedSlotRepository;
        private readonly IRepository<Booking> _bookingRepository;
        private readonly IBusinessAccessService _businessAccess;

        public StadiumService(
            ArenioDbContext context,
            ICurrentUserService currentUser,
            IStadiumRepository stadiumRepository,
        IRedisCacheService redisCacheService,
        IRepository<Booking> _bookingRepository,
        IRepository<StadiumBlockedSlot> _blockedSlotRepository,
        IBusinessAccessService businessAccess)
        {
            _context = context;
            _currentUser = currentUser;
            _stadiumRepository = stadiumRepository;
            _redisCacheService = redisCacheService;
            this._bookingRepository = _bookingRepository;
            this._blockedSlotRepository = _blockedSlotRepository;
            _businessAccess = businessAccess;
        }

        // ---- Redis cache açarları -------------------------------------------------
        // Stadion məlumatı nadir dəyişir → cache-lənir.
        // DİQQƏT: booking availability (boş slotlar) BURAYA SALINMIR — o, real-time
        // məlumatdır və cache-lənsə istifadəçi tutulmuş saatı boş görə bilər.
        private const string StadiumListCachePrefix = "stadiums:view:";
        private const string StadiumDetailCachePrefix = "stadium:detail:";
        private static readonly TimeSpan StadiumDetailCacheTtl = TimeSpan.FromMinutes(10);

        private static string StadiumDetailCacheKey(Guid stadiumId)
            => $"{StadiumDetailCachePrefix}{stadiumId}";

        /// <summary>
        /// Stadion dəyişəndə həm onun detal cache-ini, həm də səhifələnmiş siyahı
        /// cache-lərini silir. Hər mutasiyadan (update/delete/activate/verify) sonra çağırılır.
        /// </summary>
        private async Task InvalidateStadiumCachesAsync(Guid stadiumId)
        {
            await _redisCacheService.RemoveAsync(StadiumDetailCacheKey(stadiumId));
            await _redisCacheService.RemoveByPrefixAsync(StadiumListCachePrefix);
        }
        public async Task<BaseResponse<string?>> CreateStadium(StadiumCreateDto dto)
        {
            // Owner öz profilini, işçi isə aid olduğu biznesin profilini alır
            var profileId = await _businessAccess.ResolveOwnerProfileIdAsync();

            if (string.IsNullOrEmpty(profileId))
                return new BaseResponse<string?>(
                    "Owner profile not found",
                    HttpStatusCode.NotFound);

            var stadium = new Stadium
            {
                Name = dto.Name,
                Description = dto.Description,
                City = dto.City,
                Address = dto.Address,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                PricePerHour = dto.PricePerHour,
                Size = dto.Size,
                SurfaceType = dto.SurfaceType,
                OpenTime = dto.OpenTime,
                CloseTime = dto.CloseTime,
                MinBookingMinutes = dto.MinBookingMinutes,
                MaxBookingMinutes = dto.MaxBookingMinutes,

                StadiumOwnerProfileId = profileId,

                IsActive = true,
                VerificationStatus = StadiumVerificationStatus.Pending
            };

            _context.Stadiums.Add(stadium);
            await _context.SaveChangesAsync();
            // Təsdiqlənməmiş stadion axtarışda və siyahıda görünmür
            // (SearchAsync və ViewAsync yalnız IsActive + Verified süzür)

            return new BaseResponse<string?>(
                stadium.Id.ToString(),
                "Stadium submitted for verification.",
                HttpStatusCode.Created);
        }

        public async Task<BaseResponse<string?>> DeleteStadium(StadiumDeleteDto dto)
        {
            var userId = _currentUser.UserId;

            if (string.IsNullOrEmpty(userId))
                return new BaseResponse<string?>(
                    "Unauthorized",
                    HttpStatusCode.Unauthorized);

            var stadium = await _context.Stadiums
                .Include(x => x.StadiumOwnerProfile)
                .FirstOrDefaultAsync(x => x.Id == dto.StadiumId);

            if (stadium == null)
                return new BaseResponse<string?>(
                    "Stadium not found",
                    HttpStatusCode.NotFound);

            if (stadium.StadiumOwnerProfile.UserId != userId)
                return new BaseResponse<string?>(
                    "You cannot delete this stadium",
                    HttpStatusCode.Forbidden);

            var deletedStadiumId = stadium.Id;

            _context.Stadiums.Remove(stadium);

            await _context.SaveChangesAsync();

            // Məlumat dəyişdi → köhnə cache dərhal etibarsızdır
            await InvalidateStadiumCachesAsync(deletedStadiumId);

            return new BaseResponse<string?>(
                "Stadium deleted successfully",
                true,
                HttpStatusCode.OK);
        }

        public async Task<BaseResponse<string?>> UpdateStadiumAsync(StadiumUpdateDto dto)
        {
            var userId = _currentUser.UserId;

            if (string.IsNullOrEmpty(userId))
                return new BaseResponse<string?>(
                    "Unauthorized",
                    HttpStatusCode.Unauthorized);

            var stadium = await _context.Stadiums
                .Include(x => x.StadiumOwnerProfile)
                .FirstOrDefaultAsync(x => x.Id == dto.StadiumId);

            if (stadium == null)
                return new BaseResponse<string?>(
                    "Stadium not found",
                    HttpStatusCode.NotFound);

            if (!await _businessAccess.CanManageStadiumAsync(stadium.Id))
                return new BaseResponse<string?>(
                    "You cannot update this stadium",
                    HttpStatusCode.Forbidden);

            stadium.Name = dto.Name;
            stadium.Description = dto.Description;
            stadium.City = dto.City;
            stadium.Address = dto.Address;
            stadium.Latitude = dto.Latitude;
            stadium.Longitude = dto.Longitude;
            stadium.PricePerHour = dto.PricePerHour;
            stadium.Size = dto.Size;
            stadium.SurfaceType = dto.SurfaceType;
            stadium.OpenTime = dto.OpenTime;
            stadium.CloseTime = dto.CloseTime;
            stadium.MinBookingMinutes = dto.MinBookingMinutes;
            stadium.MaxBookingMinutes = dto.MaxBookingMinutes;

            await _context.SaveChangesAsync();

            // Məlumat dəyişdi → köhnə cache dərhal etibarsızdır
            await InvalidateStadiumCachesAsync(stadium.Id);


            return new BaseResponse<string?>(
                "Stadium updated successfully",
                true,
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<string?>> ActivateStadiumAsync(StadiumActivateDto dto)
        {
            var userId = _currentUser.UserId;

            if (string.IsNullOrEmpty(userId))
                return new BaseResponse<string?>(
                    "Unauthorized",
                    HttpStatusCode.Unauthorized);

            var stadium = await _context.Stadiums
                .Include(x => x.StadiumOwnerProfile)
                .FirstOrDefaultAsync(x => x.Id == dto.StadiumId);

            if (stadium == null)
                return new BaseResponse<string?>(
                    "Stadium not found.",
                    HttpStatusCode.NotFound);

            if (!await _businessAccess.CanManageStadiumAsync(stadium.Id))
                return new BaseResponse<string?>(
                    "You are not allowed to manage this stadium.",
                    HttpStatusCode.Forbidden);

            if (stadium.VerificationStatus != StadiumVerificationStatus.Verified)
                return new BaseResponse<string?>(
                    "Stadium has not been verified yet.",
                    HttpStatusCode.BadRequest);

            if (stadium.IsActive)
                return new BaseResponse<string?>(
                    "Stadium is already active.",
                    HttpStatusCode.BadRequest);

            stadium.IsActive = true;

            await _context.SaveChangesAsync();

            // Məlumat dəyişdi → köhnə cache dərhal etibarsızdır
            await InvalidateStadiumCachesAsync(stadium.Id);

            return new BaseResponse<string?>(
                "Stadium activated successfully.",
                true,
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<string?>> DeActivateStadiumAsync(StadiumDeactivateDto dto)
        {
            var userId = _currentUser.UserId;

            if (string.IsNullOrEmpty(userId))
                return new BaseResponse<string?>(
                    "Unauthorized",
                    HttpStatusCode.Unauthorized);

            var stadium = await _context.Stadiums
                .Include(x => x.StadiumOwnerProfile)
                .FirstOrDefaultAsync(x => x.Id == dto.StadiumId);

            if (stadium == null)
                return new BaseResponse<string?>(
                    "Stadium not found.",
                    HttpStatusCode.NotFound);

            if (!await _businessAccess.CanManageStadiumAsync(stadium.Id))
                return new BaseResponse<string?>(
                    "You are not allowed to manage this stadium.",
                    HttpStatusCode.Forbidden);

            if (!stadium.IsActive)
                return new BaseResponse<string?>(
                    "Stadium is already inactive.",
                    HttpStatusCode.BadRequest);

            stadium.IsActive = false;

            await _context.SaveChangesAsync();

            // Məlumat dəyişdi → köhnə cache dərhal etibarsızdır
            await InvalidateStadiumCachesAsync(stadium.Id);

            return new BaseResponse<string?>(
                "Stadium deactivated successfully.",
                true,
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<string?>> VerifyStadiumAsync(StadiumVerifyDto dto)
        {
            var stadium = await _context.Stadiums
                .FirstOrDefaultAsync(x => x.Id == dto.StadiumId);

            if (stadium == null)
            {
                return new BaseResponse<string?>(
                    "Stadium not found.",
                    HttpStatusCode.NotFound);
            }

            if (stadium.VerificationStatus != StadiumVerificationStatus.Pending)
            {
                return new BaseResponse<string?>(
                    "This stadium has already been reviewed.",
                    HttpStatusCode.BadRequest);
            }

            if (dto.VerificationStatus == StadiumVerificationStatus.Pending)
            {
                return new BaseResponse<string?>(
                    "Invalid verification status.",
                    HttpStatusCode.BadRequest);
            }

            stadium.VerificationStatus = dto.VerificationStatus;

            if (dto.VerificationStatus == StadiumVerificationStatus.Rejected)
            {
                stadium.IsActive = false;
            }

            await _context.SaveChangesAsync();

            // Məlumat dəyişdi → köhnə cache dərhal etibarsızdır
            await InvalidateStadiumCachesAsync(stadium.Id);

            var message = dto.VerificationStatus == StadiumVerificationStatus.Verified
                ? "Stadium verified successfully."
                : "Stadium rejected successfully.";

            return new BaseResponse<string?>(
                message,
                true,
                HttpStatusCode.OK);
        }
        public async Task<PagedResult<ViewStadiumDto>> ViewAsync(
        PaginationRequest request,
        CancellationToken cancellationToken)
        {
            var cacheKey = $"stadiums:view:{request.PageNumber}:{request.PageSize}";

            var cached = await _redisCacheService
                .GetAsync<PagedResult<ViewStadiumDto>>(cacheKey);

            if (cached is not null)
                return cached;

            var query = _stadiumRepository
                .GetAll()
                .AsNoTracking()
               .Where(x =>
               x.IsActive &&
               x.VerificationStatus == StadiumVerificationStatus.Verified);

            var result = await query
                .OrderBy(x => x.Name)
                .Select(x => new ViewStadiumDto
                {
                    Id = x.Id,
                    Name = x.Name,
                   
                    City = x.City,
                    Address = x.Address,
                    PricePerHour = x.PricePerHour,
                    Size = x.Size,
                  
                })
                .ToPagedResultAsync(request, cancellationToken);

            await _redisCacheService.SetAsync(
                cacheKey,
                result,
                TimeSpan.FromMinutes(10));

            return result;
        }
        /// <summary>
        /// Publik stadion detalı. Yalnız aktiv və təsdiqlənmiş stadionlar qaytarılır,
        /// icazə tələb etmir — sayt ziyarətçisi də görə bilməlidir.
        /// Nəticə Redis-də saxlanılır; stadion dəyişəndə cache silinir.
        /// Boş saatlar (availability) qəsdən bu cavaba DAXİL EDİLMİR — onlar
        /// /api/Booking/available-slots endpoint-indən real-time gəlir.
        /// </summary>
        public async Task<BaseResponse<StadiumViewDetailDto?>> ViewDetailAsync(
            Guid stadiumId,
            CancellationToken cancellationToken = default)
        {
            var cacheKey = StadiumDetailCacheKey(stadiumId);

            var cached = await _redisCacheService
                .GetAsync<StadiumViewDetailDto>(cacheKey);

            if (cached is not null)
            {
                return new BaseResponse<StadiumViewDetailDto?>(
                    cached,
                    "Stadium detail retrieved successfully.",
                    HttpStatusCode.OK);
            }

            var detail = await _context.Stadiums
                .AsNoTracking()
                .Where(x =>
                    x.Id == stadiumId &&
                    x.IsActive &&
                    x.VerificationStatus == StadiumVerificationStatus.Verified)
                .Select(x => new StadiumViewDetailDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    City = x.City,
                    Address = x.Address,
                    Latitude = x.Latitude,
                    Longitude = x.Longitude,
                    PricePerHour = x.PricePerHour,
                    Size = x.Size,
                    SurfaceType = x.SurfaceType,
                    OpenTime = x.OpenTime,
                    CloseTime = x.CloseTime,
                    MinBookingMinutes = x.MinBookingMinutes,
                    MaxBookingMinutes = x.MaxBookingMinutes,
                    IsActive = x.IsActive,
                    VerificationStatus = x.VerificationStatus,
                    AverageRating = x.AverageRating,
                    TotalReviews = x.TotalReviews,
                    // Əsas şəkil: IsMain, yoxdursa sıraya görə birinci
                    MainImageUrl = x.Images
                        .OrderByDescending(i => i.IsMain)
                        .ThenBy(i => i.Order)
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (detail is null)
            {
                return new BaseResponse<StadiumViewDetailDto?>(
                    "Stadium not found",
                    HttpStatusCode.NotFound);
            }

            await _redisCacheService.SetAsync(
                cacheKey,
                detail,
                StadiumDetailCacheTtl);

            return new BaseResponse<StadiumViewDetailDto?>(
                detail,
                "Stadium detail retrieved successfully.",
                HttpStatusCode.OK);
        }

        public async Task<BaseResponse<StadiumGetByIdDto?>> GetById(Guid stadiumId)
        {
            var stadium = await _context.Stadiums
                .FirstOrDefaultAsync(x => x.Id == stadiumId);

            if (stadium == null)
            {
                return new BaseResponse<StadiumGetByIdDto?>(
                    "Stadium not found",
                    HttpStatusCode.NotFound);
            }

            var dto = new StadiumGetByIdDto
            {
                StadiumOwnerProfileId = stadium.StadiumOwnerProfileId,

                Name = stadium.Name,
                Description = stadium.Description,
                City = stadium.City,
                Address = stadium.Address,
                Latitude = stadium.Latitude,
                Longitude = stadium.Longitude,
                PricePerHour = stadium.PricePerHour,
                Size = stadium.Size,
                SurfaceType = stadium.SurfaceType,
                OpenTime = stadium.OpenTime,
                CloseTime = stadium.CloseTime,
                MinBookingMinutes = stadium.MinBookingMinutes,
                MaxBookingMinutes = stadium.MaxBookingMinutes
            };

            return new BaseResponse<StadiumGetByIdDto?>(
                dto,
                "Stadium details retrieved successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<List<StadiumViewDetailDto>>> GetByUserId(string userId)
        {
            var ownerProfile = await _context.StadiumOwnerProfiles
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (ownerProfile == null)
            {
                return new BaseResponse<List<StadiumViewDetailDto>>(
                    "Owner profile not found",
                    HttpStatusCode.NotFound);
            }

            var stadiums = await _context.Stadiums
                .Where(x => x.StadiumOwnerProfileId == ownerProfile.Id)
                .Select(x => new StadiumViewDetailDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    City = x.City,
                    Address = x.Address,
                    Latitude = x.Latitude,
                    Longitude = x.Longitude,
                    PricePerHour = x.PricePerHour,
                    Size = x.Size,
                    SurfaceType = x.SurfaceType,
                    OpenTime = x.OpenTime,
                    CloseTime = x.CloseTime,
                    MinBookingMinutes = x.MinBookingMinutes,
                    MaxBookingMinutes = x.MaxBookingMinutes,
                    IsActive = x.IsActive,
                    VerificationStatus = x.VerificationStatus,
                    AverageRating = x.AverageRating,
                    TotalReviews = x.TotalReviews,
                    // Əsas şəkil: IsMain, yoxdursa sıraya görə birinci
                    MainImageUrl = x.Images
                        .OrderByDescending(i => i.IsMain)
                        .ThenBy(i => i.Order)
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return new BaseResponse<List<StadiumViewDetailDto>>(
                stadiums, "Stadiums retrieved successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<List<StadiumViewDetailDto>>> GetMyStadiums()
        {
            // Owner → öz stadionları; işçi → aid olduğu biznesin stadionları
            var profileId = await _businessAccess.ResolveOwnerProfileIdAsync();

            if (string.IsNullOrEmpty(profileId))
            {
                return new BaseResponse<List<StadiumViewDetailDto>>(
                    "Owner profile not found",
                    HttpStatusCode.NotFound);
            }

            var stadiums = await _context.Stadiums
                .Where(x => x.StadiumOwnerProfileId == profileId)
                .Select(x => new StadiumViewDetailDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    City = x.City,
                    Address = x.Address,
                    Latitude = x.Latitude,
                    Longitude = x.Longitude,
                    PricePerHour = x.PricePerHour,
                    Size = x.Size,
                    SurfaceType = x.SurfaceType,
                    OpenTime = x.OpenTime,
                    CloseTime = x.CloseTime,
                    MinBookingMinutes = x.MinBookingMinutes,
                    MaxBookingMinutes = x.MaxBookingMinutes,
                    IsActive = x.IsActive,
                    VerificationStatus = x.VerificationStatus,
                    AverageRating = x.AverageRating,
                    TotalReviews = x.TotalReviews,
                    // Əsas şəkil: IsMain, yoxdursa sıraya görə birinci
                    MainImageUrl = x.Images
                        .OrderByDescending(i => i.IsMain)
                        .ThenBy(i => i.Order)
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return new BaseResponse<List<StadiumViewDetailDto>>(
                stadiums, "Owners stadiums retrieved successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<PagedResult<BookingOwnerDto>>> GetMyStadiumBookingsAsync(
        BookingOwnerFilterDto filter)
        {
            var profileId = await _businessAccess.ResolveOwnerProfileIdAsync();

            if (string.IsNullOrEmpty(profileId))
                return new BaseResponse<PagedResult<BookingOwnerDto>>(
                    "Owner profile not found",
                    HttpStatusCode.NotFound);

            var query = _context.Bookings
                .AsNoTracking()
                .Include(x => x.User)
                .Include(x => x.Stadium)
                .Where(x => x.Stadium.StadiumOwnerProfileId == profileId);

            if (filter.StadiumId.HasValue)
                query = query.Where(x => x.StadiumId == filter.StadiumId.Value);

            if (filter.Status.HasValue)
                query = query.Where(x => x.Status == filter.Status.Value);
            // FromDate/ToDate Bakı TƏQVİM tarixləridir (məs. 2026-08-21).
            // Bakı günü 00:00-dan növbəti günün 00:00-na qədərdir və DB UTC-də
            // saxladığı üçün sərhədlər Bakı → UTC çevrilir.
            if (filter.FromDate.HasValue)
            {
                var fromUtc = DateTimeHelper.ToUtc(filter.FromDate.Value.Date);

                query = query.Where(x => x.StartDateTime >= fromUtc);
            }

            if (filter.ToDate.HasValue)
            {
                // Yuxarı sərhəd EKSKLÜZİVDİR: seçilmiş günün özü tam daxil olsun deyə
                // növbəti günün 00:00 Bakı anı götürülür. `EndDateTime <= ToDate`
                // müqayisəsi həmin günün axşam bronlarını səhvən kənarlaşdırırdı.
                var toUtcExclusive = DateTimeHelper.ToUtc(
                    filter.ToDate.Value.Date.AddDays(1));

                query = query.Where(x => x.StartDateTime < toUtcExclusive);
            }

            var pagination = new PaginationRequest
            {
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize
            };

            var bookings = await query
                .OrderByDescending(x => x.StartDateTime)
                .Select(x => new BookingOwnerDto
                {
                    BookingId = x.Id,
                    StadiumId = x.StadiumId,
                    StadiumName = x.Stadium.Name,
                    CustomerId = x.UserId,
                    CustomerName = x.User.FullName,
                    StartDateTime = x.StartDateTime,
                    EndDateTime = x.EndDateTime,
                    TotalPrice = x.TotalPrice,
                    Status = x.Status
                })
                .ToPagedResultAsync(pagination);

            return new BaseResponse<PagedResult<BookingOwnerDto>>(
                bookings,
                "Bookings retrieved successfully.",
                HttpStatusCode.OK);
        }


        public async Task<BaseResponse<StadiumBlockedSlotDto>> BlockTimeAsync(
      Guid stadiumId,
      StadiumBlockedSlotCreateDto dto,
      CancellationToken cancellationToken = default)
        {
            var userId = _currentUser.UserId;

            if (string.IsNullOrWhiteSpace(userId))
            {
                return new BaseResponse<StadiumBlockedSlotDto>(
                    "Unauthorized",
                    HttpStatusCode.Unauthorized);
            }

            // Frontend Bakı divar saatı göndərir (məs. 18:00 = 18:00 Bakı).
            // DB və bütün müqayisələr üçün UTC-yə çevrilir: 18:00 Bakı → 14:00 UTC.
            var startTime = DateTimeHelper.ToUtc(dto.StartTime);

            var endTime = DateTimeHelper.ToUtc(dto.EndTime);

            // Date validation
            if (startTime >= endTime)
            {
                return new BaseResponse<StadiumBlockedSlotDto>(
                    "Start time must be earlier than end time.",
                    HttpStatusCode.BadRequest);
            }

            // Keçmişə block qoyulmasın
            if (startTime <= DateTime.UtcNow)
            {
                return new BaseResponse<StadiumBlockedSlotDto>(
                    "You cannot block a time in the past.",
                    HttpStatusCode.BadRequest);
            }

            // Stadionu idarə etmək icazəsi
            if (!await _businessAccess.CanManageStadiumAsync(stadiumId))
            {
                return new BaseResponse<StadiumBlockedSlotDto>(
                    "Stadium not found or you are not allowed to manage it.",
                    HttpStatusCode.NotFound);
            }

            // Mövcud booking ilə conflict
            var hasBooking = await _bookingRepository
                .GetByFiltered(
                    x => x.StadiumId == stadiumId
                         && x.StartDateTime < endTime
                         && x.EndDateTime > startTime
                         && x.Status != BookingStatus.Cancelled,
                    isTracking: false)
                .AnyAsync(cancellationToken);

            if (hasBooking)
            {
                return new BaseResponse<StadiumBlockedSlotDto>(
                    "This time overlaps with an existing booking.",
                    HttpStatusCode.Conflict);
            }

            // Mövcud blocked slot ilə conflict
            var hasBlockedSlot = await _blockedSlotRepository
                .GetByFiltered(
                    x => x.StadiumId == stadiumId
                         && x.StartTime < endTime
                         && x.EndTime > startTime,
                    isTracking: false)
                .AnyAsync(cancellationToken);

            if (hasBlockedSlot)
            {
                return new BaseResponse<StadiumBlockedSlotDto>(
                    "This time is already blocked.",
                    HttpStatusCode.Conflict);
            }

            var blockedSlot = new StadiumBlockedSlot
            {
                Id = Guid.NewGuid(),
                StadiumId = stadiumId,
                StartTime = startTime,
                EndTime = endTime,
                Reason = dto.Reason,
                CreatedByUserId = userId
            };

            await _blockedSlotRepository.AddAsync(blockedSlot);

            await _blockedSlotRepository.SaveChangeAsync();

            var result = new StadiumBlockedSlotDto
            {
                Id = blockedSlot.Id,
                StadiumId = blockedSlot.StadiumId,
                // Cavabda istifadəçiyə görünən (Bakı) vaxt qaytarılır: 14:00 UTC → 18:00 Bakı
                StartTime = DateTimeHelper.ToBaku(blockedSlot.StartTime),
                EndTime = DateTimeHelper.ToBaku(blockedSlot.EndTime),
                Reason = blockedSlot.Reason
            };

            return new BaseResponse<StadiumBlockedSlotDto>(
                result,
                "Stadium time blocked successfully.",
                HttpStatusCode.Created);
        }

        public async Task<BaseResponse<List<StadiumBlockedSlotDto>>> GetBlockedSlotsAsync(
    Guid stadiumId,
    CancellationToken cancellationToken = default)
        {
            var userId = _currentUser.UserId;

            if (string.IsNullOrWhiteSpace(userId))
            {
                return new BaseResponse<List<StadiumBlockedSlotDto>>(
                    "Unauthorized",
                    HttpStatusCode.Unauthorized);
            }

            // Stadionu idarə etmək icazəsi (owner və ya aktiv işçi)
            if (!await _businessAccess.CanManageStadiumAsync(stadiumId))
            {
                return new BaseResponse<List<StadiumBlockedSlotDto>>(
                    "Stadium not found or you are not allowed to manage it.",
                    HttpStatusCode.NotFound);
            }

            // DB-dəki dəyərlər UTC-dir; istifadəçiyə görünən cavab Bakı vaxtına çevrilir.
            // Çevirmə SQL-ə tərcümə olunmadığı üçün əvvəl yaddaşa oxunur, sonra map edilir.
            var slotEntities = await _blockedSlotRepository
                .GetByFiltered(
                    x => x.StadiumId == stadiumId,
                    isTracking: false)
                .OrderBy(x => x.StartTime)
                .ToListAsync(cancellationToken);

            var slots = slotEntities
                .Select(x => new StadiumBlockedSlotDto
                {
                    Id = x.Id,
                    StadiumId = x.StadiumId,
                    StartTime = DateTimeHelper.ToBaku(x.StartTime),
                    EndTime = DateTimeHelper.ToBaku(x.EndTime),
                    Reason = x.Reason
                })
                .ToList();

            return new BaseResponse<List<StadiumBlockedSlotDto>>(
                slots,
                "Blocked slots retrieved successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<string>> UnblockAsync(
    Guid blockedSlotId,
    CancellationToken cancellationToken = default)
        {
            var userId = _currentUser.UserId;

            if (string.IsNullOrWhiteSpace(userId))
            {
                return new BaseResponse<string>(
                    "Unauthorized",
                    HttpStatusCode.Unauthorized);
            }

            var blockedSlot = await _blockedSlotRepository
                .GetByFiltered(
                    x => x.Id == blockedSlotId,
                    isTracking: true)
                .FirstOrDefaultAsync(cancellationToken);

            if (blockedSlot is null)
            {
                return new BaseResponse<string>(
                    "Blocked slot not found.",
                    HttpStatusCode.NotFound);
            }

            // Owner-in bloklladığını işçi, işçinin bloklladığını owner da aça bilsin
            if (!await _businessAccess.CanManageStadiumAsync(blockedSlot.StadiumId))
            {
                return new BaseResponse<string>(
                    "You are not allowed to manage this stadium.",
                    HttpStatusCode.Forbidden);
            }

            _blockedSlotRepository.Delete(blockedSlot);

            await _blockedSlotRepository.SaveChangeAsync();

            return new BaseResponse<string>(
                "Stadium time unblocked successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<List<StadiumPendingDto>>> GetPendingStadiumsAsync(
    CancellationToken cancellationToken = default)
        {
            var stadiums = await _context.Stadiums
                .AsNoTracking()
                .Where(x =>
                    x.VerificationStatus == StadiumVerificationStatus.Pending)
                .Select(x => new StadiumPendingDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    City = x.City,
                    Address = x.Address,
                    PricePerHour = x.PricePerHour,
                    
                    SurfaceType = x.SurfaceType,
                    OpenTime = x.OpenTime,
                    CloseTime = x.CloseTime,
                    VerificationStatus = x.VerificationStatus
                })
                .ToListAsync(cancellationToken);

            return new BaseResponse<List<StadiumPendingDto>>(
                stadiums,
                "Pending stadiums retrieved successfully.",
                HttpStatusCode.OK);
        }

    
        /// <summary>
        /// Stadion axtarışı — Elasticsearch əvəzinə birbaşa PostgreSQL üzərində
        /// (ad/şəhər/təsvir, hərf registrindən asılı olmayan ILIKE).
        /// Yalnız aktiv + təsdiqlənmiş stadionlar qaytarılır.
        /// Cavab forması köhnə Elastic sənədi ilə eynidir — frontend dəyişmir.
        /// </summary>
        public async Task<List<StadiumDocument>> SearchAsync(
            string q,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(q))
                return new List<StadiumDocument>();

            var pattern = $"%{q.Trim()}%";

            return await _context.Stadiums
                .AsNoTracking()
                .Where(x =>
                    x.IsActive &&
                    x.VerificationStatus == StadiumVerificationStatus.Verified &&
                    (EF.Functions.ILike(x.Name, pattern) ||
                     EF.Functions.ILike(x.City, pattern) ||
                     EF.Functions.ILike(x.Description, pattern)))
                .OrderBy(x => x.Name)
                .Take(20)
                .Select(x => new StadiumDocument
                {
                    Id = x.Id,
                    Name = x.Name,
                    City = x.City,
                    PricePerHour = x.PricePerHour,
                    Description = x.Description
                })
                .ToListAsync(cancellationToken);
        }

    }

}
