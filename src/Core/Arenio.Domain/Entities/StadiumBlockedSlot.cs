using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Domain.Entities
{
    public class StadiumBlockedSlot : BaseEntity
    {
        public Guid StadiumId { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public string? Reason { get; set; }

        public string CreatedByUserId { get; set; } = null!;

        public Stadium Stadium { get; set; } = null!;
    }
}
