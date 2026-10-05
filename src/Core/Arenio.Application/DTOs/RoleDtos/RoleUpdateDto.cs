using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.RoleDtos
{
    public record class RoleUpdateDto
    {
        public string RoleId { get; set; } = null!;
        public List<string> Permissions { get; set; } = new();
    }
}
