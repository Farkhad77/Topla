using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Domain.Entities
{
    public class User : IdentityUser
    {
        public string FullName { get; set; }

        public DateTime LastLoginDate { get; set; }

        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryDate { get; set; }
        public bool IsBlocked { get; set; }

        public string? BlockReason { get; set; }

        public DateTime? BlockedAt { get; set; }

        public string? BlockedById { get; set; }
        public ICollection<Booking> Bookings { get; set; }
        public ICollection<OwnerRequest> OwnerRequests { get; set; }
    = new List<OwnerRequest>();
        public StadiumOwnerProfile? StadiumOwnerProfile { get; set; }
    }
}
