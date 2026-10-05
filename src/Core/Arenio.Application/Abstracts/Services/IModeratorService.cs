using Arenio.Application.DTOs.RequestDtos;
using Arenio.Application.DTOs.StadiumDtos;
using Arenio.Application.DTOs.UserDtos;
using Arenio.Application.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Arenio.Application.DTOs.StadiumDtos.StadiumPendingDto;

namespace Arenio.Application.Abstracts.Services
{
    public interface IModeratorService
    {
        #region Owner Requests

        Task<BaseResponse<PagedResult<RequestViewOwnerDto>>> GetPendingOwnerRequests(
            int pageNumber,
            int pageSize);

        Task<BaseResponse<RequestViewOwnerDto>> GetOwnerRequestById(
            Guid requestId);

        Task<BaseResponse<string>> ApproveOwnerRequest(
            Guid requestId);

        Task<BaseResponse<string>> RejectOwnerRequest(
            Guid requestId,
            RequestRejectDto dto);
       
        Task<BaseResponse<string?>> BlockUserAsync(string userId, UserBlockDto dto);

        Task<BaseResponse<string?>> UnblockUserAsync(string userId);

        Task<BaseResponse<string?>> AssignModeratorRoleAsync(AssignModeratorDto dto);
        
        #endregion


    }
}
