using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.UserDtos
{
    public record class UserBlockDto
    {
        public string Reason { get; set; } = default!;
    }
}
