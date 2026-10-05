using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.UserDtos
{
    public record class AssignModeratorDto
    {
        public string Email { get; set; } = null!;
    }
}
