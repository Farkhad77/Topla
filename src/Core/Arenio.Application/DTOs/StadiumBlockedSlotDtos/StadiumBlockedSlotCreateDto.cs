using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.StadiumBlockedSlotDtos
{
    public class StadiumBlockedSlotCreateDto
    {
        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public string? Reason { get; set; }
    }
}
