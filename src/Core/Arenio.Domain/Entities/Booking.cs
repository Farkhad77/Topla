using Arenio.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Domain.Entities
{
    public class Booking : BaseEntity { 
    
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public User User { get; set; }

        public Guid StadiumId { get; set; }
        public Stadium Stadium { get; set; }

        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }

        public decimal TotalPrice { get; set; }

        public BookingStatus Status { get; set; } // Pending, Confirmed, Cancelled

        public Payment Payment { get; set; }
        public string? RejectReason { get; set; }
    }
}
