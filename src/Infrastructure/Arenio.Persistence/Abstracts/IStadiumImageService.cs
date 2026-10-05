using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Abstracts
{
    using Arenio.Application.DTOs.StadiumImagesDtos;
    using Arenio.Application.Settings;
    using Microsoft.AspNetCore.Http;

    public interface IStadiumImageService
    {
        Task<BaseResponse<List<StadiumImageDto>>> UploadImagesAsync(
            Guid stadiumId,
            List<IFormFile> files);

        Task<BaseResponse<object>> DeleteImageAsync(Guid imageId);

        Task<BaseResponse<object>> SetMainImageAsync(Guid imageId);

        Task<BaseResponse<List<StadiumImageDto>>> GetByStadiumIdAsync(Guid stadiumId);
        Task<BaseResponse<object>> ReorderImagesAsync(StadiumImagesReorderDto dto);
    }
}
