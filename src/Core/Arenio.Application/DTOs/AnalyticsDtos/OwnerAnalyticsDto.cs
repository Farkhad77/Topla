using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.AnalyticsDtos
{
    public record class OwnerKpisDto
    {
        public int TotalBookings { get; set; }

        public int TodayBookings { get; set; }

        public int UpcomingBookings { get; set; }

        public int CompletedBookings { get; set; }

        public int CancelledBookings { get; set; }

        public decimal RevenueTotal { get; set; }

        public decimal RevenueThisMonth { get; set; }

        /// <summary>Dövr üzrə doluluk faizi (0–100).</summary>
        public double OccupancyRate { get; set; }

        public decimal AverageRating { get; set; }

        public int TotalReviews { get; set; }
    }

    /// <summary>
    /// GET /api/Analytics/owner cavabı. Bütün vaxt qruplaması Bakı təqviminə görədir.
    /// </summary>
    public record class OwnerAnalyticsDto
    {
        public OwnerKpisDto Kpis { get; set; } = new();

        public List<TimeSeriesPointDto> RevenueByMonth { get; set; } = new();

        public List<TimeSeriesPointDto> BookingsByMonth { get; set; } = new();

        public List<TimeSeriesPointDto> BookingsByWeekday { get; set; } = new();

        public List<TimeSeriesPointDto> PeakHours { get; set; } = new();

        public List<TimeSeriesPointDto> RevenueByStadium { get; set; } = new();
    }
}
