using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.BookingDtos
{
    public record class BookingRejectedEventDto
    {
        public Guid BookingId { get; set; }

        public string Email { get; set; } = null!;

        public string UserName { get; set; } = null!;

        public string StadiumName { get; set; } = null!;

        public string RejectReason { get; set; } = null!;

        public DateTime BookingDate { get; set; }
    }
}
