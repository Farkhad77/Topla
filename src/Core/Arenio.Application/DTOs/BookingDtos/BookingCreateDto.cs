using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.BookingDtos
{
    public record class BookingCreateDto
    {
      

        public Guid StadiumId { get; set; }

        // booking start time (full datetime)
        public DateTime StartDateTime { get; set; }

        // 60, 120 (dəqiqə ilə)
        public int DurationMinutes { get; set; }
    }
}
