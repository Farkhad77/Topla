using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.RoleDtos
{
    public record class RoleCreateDto
    {
        public string Name { get; set; } = null!;
        public List<string> PermissionsList { get; set; }
    }
}
