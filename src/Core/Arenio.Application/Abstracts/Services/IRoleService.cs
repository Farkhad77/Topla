using Arenio.Application.DTOs.RoleDtos;
using Arenio.Application.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Services
{
    public interface IRoleService
    {
        Task<BaseResponse<string?>> CreateRole(RoleCreateDto dto);
        Task<BaseResponse<string?>> DeleteRole(RoleDeleteDto dto);
       
        Task<BaseResponse<string>> RoleUpdateAsync(RoleUpdateDto dto);
        Task<List<string>> GetPermissionsByRoleAsync(string userId);
    }
}
