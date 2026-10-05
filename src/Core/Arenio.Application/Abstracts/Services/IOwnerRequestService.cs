using Arenio.Application.DTOs.RequestDtos;
using Arenio.Application.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Services
{
    public interface IOwnerRequestService
    {
        Task<BaseResponse<string>> CreateRequest(
            RequestCreateOwnerDto dto);

        Task<BaseResponse<RequestViewOwnerDto>> GetMyRequest();
    }
}
