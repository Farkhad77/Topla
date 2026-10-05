using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.BookingDtos
{
    public record BookingPreviewDto
    {
        public Guid StadiumId { get; init; }

        public string StadiumName { get; init; } = null!;

        public DateTime StartDateTime { get; init; }

        public DateTime EndDateTime { get; init; }

        public int DurationMinutes { get; init; }

        public decimal PricePerHour { get; init; }

        public decimal TotalPrice { get; init; }

        public bool IsAvailable { get; init; }
    }
}

