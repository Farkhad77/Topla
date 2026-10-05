using Arenio.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Domain.Entities
{
    public class Payment : BaseEntity
    {
        public Guid BookingId { get; set; }
        public Booking Booking { get; set; }

        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; }
        public PaymentStatus Status { get; set; }

        public string TransactionId { get; set; }
    }
}
