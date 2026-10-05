using Arenio.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.StadiumDtos
{
    /// <summary>
    /// Stadionun tam publik detalı.
    /// Həm /api/Stadiums/view-detail/{id} (ziyarətçi üçün, cache-li),
    /// həm də owner-in öz stadionları siyahısı bu DTO-nu qaytarır.
    /// DİQQƏT: boş saatlar (availability) burada YOXDUR — onlar real-time
    /// məlumatdır və /api/Booking/available-slots endpoint-indən gəlir.
    /// </summary>
    public record class StadiumViewDetailDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string City { get; set; }
        public string Address { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public decimal PricePerHour { get; set; }
        public string Size { get; set; } // 5x5, 7x7, 11x11
        public string SurfaceType { get; set; }

        // CONFIG
        public TimeOnly OpenTime { get; set; }
        public TimeOnly CloseTime { get; set; }
        public int MinBookingMinutes { get; set; }
        public int MaxBookingMinutes { get; set; }

        // STATUS + REYTİNQ
        public bool IsActive { get; set; }
        public StadiumVerificationStatus VerificationStatus { get; set; }
        public decimal AverageRating { get; set; }
        public int TotalReviews { get; set; }

        /// <summary>
        /// Əsas şəkilin nisbi URL-i ("Storage/Stadiums/xxx.webp").
        /// IsMain işarələnən, yoxdursa sıraya görə birinci şəkil; şəkil yoxdursa null.
        /// </summary>
        public string? MainImageUrl { get; set; }
    }
}
