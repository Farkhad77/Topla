using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.WorkerDtos
{
    // İşçinin aid olduğu biznes və oranın stadionları
    public record class WorkerBusinessDto
    {
        public string OwnerProfileId { get; set; } = default!;
        public List<WorkerStadiumBriefDto> Stadiums { get; set; } = new();
    }

    public record class WorkerStadiumBriefDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string City { get; set; } = default!;
    }
}
