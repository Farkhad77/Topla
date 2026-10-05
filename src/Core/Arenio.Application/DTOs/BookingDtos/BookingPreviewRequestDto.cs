using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.BookingDtos
{
    public record BookingPreviewRequestDto
    {
        public Guid StadiumId { get; init; }

        public DateTime StartDateTime { get; init; }

        public int DurationMinutes { get; init; }
    }
}
