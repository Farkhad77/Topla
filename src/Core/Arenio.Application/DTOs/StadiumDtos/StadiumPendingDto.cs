using Arenio.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.StadiumDtos
{
    public record class StadiumPendingDto
    {
        public DateTime CreatedAt { get; set; }
        public string? OwnerId { get; set; }

        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string City { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public decimal PricePerHour { get; set; }
        public string SurfaceType { get; set; } = string.Empty;
        public TimeOnly OpenTime { get; set; }
        public TimeOnly CloseTime { get; set; }
        public StadiumVerificationStatus VerificationStatus { get; set; }

    }
}
