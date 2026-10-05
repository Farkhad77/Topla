using Arenio.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace Arenio.Domain.Entities
{
    public class Stadium : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }

        public string City { get; set; }
        public string Address { get; set; }

        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public decimal PricePerHour { get; set; }

        public string Size { get; set; } // 5x5, 7x7, 11x11
        public string SurfaceType { get; set; }

        // CONFIG (çox vacib əlavə)
        public TimeOnly OpenTime { get; set; }
        public TimeOnly CloseTime { get; set; }

        public int MinBookingMinutes { get; set; } 
        public int MaxBookingMinutes { get; set; }
        public bool IsActive { get; set; }
        public decimal AverageRating { get; set; } = 0; // Məs: 4.5
        public int TotalReviews { get; set; } = 0;

        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public StadiumVerificationStatus VerificationStatus { get; set; }
        

        public string? RejectReason { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public string? ReviewedById { get; set; }

        public User? ReviewedBy { get; set; }
        public string StadiumOwnerProfileId { get; set; }
        public StadiumOwnerProfile StadiumOwnerProfile { get; set; }

        public ICollection<Booking> Bookings { get; set; }
        public ICollection<StadiumImage> Images { get; set; }
    = new List<StadiumImage>();
        public ICollection<StadiumBlockedSlot> BlockedSlots { get; set; }
    = new List<StadiumBlockedSlot>();
    }
}

