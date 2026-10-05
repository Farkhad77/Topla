using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.BookingDtos
{
    public record class BookingAvailableSlotsDto
    {
        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public bool IsAvailable { get; set; }
    }
}
