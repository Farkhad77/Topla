using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.StadiumDtos
{
    public record class StadiumCreateDto
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
    }
}
