using Arenio.Application.DTOs.ReviewDtos;
using Arenio.Application.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Services
{
    public interface IReviewService
    {
        Task<BaseResponse<string?>> CreateReviewAsync(
            ReviewCreateDto dto,
            CancellationToken cancellationToken);

        Task<BaseResponse<string?>> UpdateReviewAsync(
            Guid reviewId,
            ReviewUpdateDto dto,
            CancellationToken cancellationToken);

        Task<BaseResponse<string?>> DeleteReviewAsync(
            Guid reviewId,
            CancellationToken cancellationToken);

        Task<BaseResponse<string?>> DeleteMyReviewAsync(
            Guid reviewId,
            CancellationToken cancellationToken);

        Task<BaseResponse<List<ReviewViewDto>>> GetAllByStadiumIdAsync(
            Guid stadiumId,
            CancellationToken cancellationToken);

        Task<BaseResponse<List<ReviewViewDto>>> GetByUserIdAsync(
            string userId,
            CancellationToken cancellationToken);
    }
}
