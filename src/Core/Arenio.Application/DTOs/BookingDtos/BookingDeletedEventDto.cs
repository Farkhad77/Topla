using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.BookingDtos
{
    public record class BookingDeletedEventDto
    {
        public Guid BookingId { get; set; }
        public string Email { get; set; } = default!;
        public string UserName { get; set; } = default!;
        public string StadiumName { get; set; } = default!;
        public DateTime BookingDate { get; set; }
    }
}
