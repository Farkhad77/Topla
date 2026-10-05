using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.RequestDtos
{
    public record class RequestRejectDto
    {
        public string Reason { get; set; } = default!;
    }
}
