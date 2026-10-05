using Arenio.Application.DTOs.BookingDtos;
using Arenio.Application.DTOs.StadiumBlockedSlotDtos;
using Arenio.Application.DTOs.StadiumDtos;
using Arenio.Application.Settings;
using Arenio.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Services
{
    public interface IStadiumService
    {
        Task<BaseResponse<string?>> CreateStadium(StadiumCreateDto dto);
        Task<BaseResponse<string?>> UpdateStadiumAsync(StadiumUpdateDto dto);
        Task<BaseResponse<string?>> DeleteStadium(StadiumDeleteDto dto);
        Task<PagedResult<ViewStadiumDto>> ViewAsync(
    PaginationRequest request,
    CancellationToken cancellationToken);
        Task<BaseResponse<List<StadiumPendingDto>>> GetPendingStadiumsAsync(
      CancellationToken cancellationToken = default);
        Task<BaseResponse<StadiumViewDetailDto>> ViewDetailAsync(Guid stadiumId, CancellationToken cancellationToken);
        
        Task<BaseResponse<string?>> ActivateStadiumAsync(StadiumActivateDto dto);
        Task<BaseResponse<string?>> DeActivateStadiumAsync(StadiumDeactivateDto dto);
        Task<BaseResponse<string?>> VerifyStadiumAsync(StadiumVerifyDto dto);
        /// <summary>DB əsaslı stadion axtarışı (ad/şəhər/təsvir). Elasticsearch silinib.</summary>
        Task<List<StadiumDocument>> SearchAsync(
            string q,
            CancellationToken cancellationToken = default);
        Task<BaseResponse<StadiumGetByIdDto?>> GetById(Guid stadiumId);
        Task<BaseResponse<List<StadiumViewDetailDto>>> GetByUserId(string userId);
        Task<BaseResponse<List<StadiumViewDetailDto>>> GetMyStadiums();
        Task<BaseResponse<PagedResult<BookingOwnerDto>>> GetMyStadiumBookingsAsync(
 BookingOwnerFilterDto filter);
        Task<BaseResponse<StadiumBlockedSlotDto>> BlockTimeAsync(
     Guid stadiumId,
     StadiumBlockedSlotCreateDto dto,
     CancellationToken cancellationToken = default);

        Task<BaseResponse<List<StadiumBlockedSlotDto>>> GetBlockedSlotsAsync(
            Guid stadiumId,
            CancellationToken cancellationToken = default);

        Task<BaseResponse<string>> UnblockAsync(
            Guid blockedSlotId,
            CancellationToken cancellationToken = default);
    }
}
