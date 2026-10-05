using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.AnalyticsDtos
{
    public record class PlatformKpisDto
    {
        public int TotalUsers { get; set; }

        public int TotalOwners { get; set; }

        public int PublishedStadiums { get; set; }

        public int PendingStadiums { get; set; }

        public int PendingOwnerRequests { get; set; }

        public int TotalBookings { get; set; }

        public int ConfirmedBookings { get; set; }

        public int CompletedBookings { get; set; }

        public int CancelledBookings { get; set; }

        public decimal RevenueTotal { get; set; }
    }

    /// <summary>
    /// GET /api/Analytics/platform cavabı (Admin/Moderator).
    /// Booking göstəriciləri seçilmiş dövrə, say göstəriciləri (istifadəçi,
    /// stadion, sorğu) isə cari ana aiddir.
    /// </summary>
    public record class PlatformAnalyticsDto
    {
        public PlatformKpisDto Kpis { get; set; } = new();

        public List<TimeSeriesPointDto> BookingsByMonth { get; set; } = new();

        public List<TimeSeriesPointDto> RevenueByMonth { get; set; } = new();

        public List<TimeSeriesPointDto> BookingsByStatus { get; set; } = new();
    }
}
