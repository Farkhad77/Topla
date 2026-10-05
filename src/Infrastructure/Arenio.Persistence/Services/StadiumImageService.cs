using Arenio.Application.Abstracts.Repositories;
using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.StadiumImagesDtos;
using Arenio.Application.Settings;
using Arenio.Domain.Entities;
using Arenio.Persistence.Abstracts;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Services
{
    public class StadiumImageService:IStadiumImageService
    {
        private readonly IStadiumRepository _stadiumRepository;
        private readonly IStadiumImageRepository _imageRepository;
        private readonly IFileService _fileService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IBusinessAccessService _businessAccess;
        public StadiumImageService(IStadiumRepository stadiumRepository,
            IStadiumImageRepository stadiumImageRepository,
            IFileService fileService, ICurrentUserService currentUserService,
            IBusinessAccessService businessAccess
            )
        {
            _stadiumRepository = stadiumRepository;
            _imageRepository = stadiumImageRepository;
            _fileService = fileService;
            _currentUserService = currentUserService;
            _businessAccess = businessAccess;
        }
        public async Task<BaseResponse<List<StadiumImageDto>>> UploadImagesAsync(
    Guid stadiumId,
    List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
            {
                return new BaseResponse<List<StadiumImageDto>>(
                    "No image selected.",
                    HttpStatusCode.BadRequest);
            }

            var stadium = await _stadiumRepository
                .GetByFiltered(
                    x => x.Id == stadiumId,
                    include: new Expression<Func<Stadium, object>>[]
                    {
                x => x.Images,
                x => x.StadiumOwnerProfile
                    })
                .FirstOrDefaultAsync();

            if (stadium is null)
            {
                return new BaseResponse<List<StadiumImageDto>>(
                    "Stadium not found.",
                    HttpStatusCode.NotFound);
            }

            if (!await _businessAccess.CanManageStadiumAsync(stadium.Id))
            {
                return new BaseResponse<List<StadiumImageDto>>(
                    "You are not allowed to upload images for this stadium.",
                    HttpStatusCode.Forbidden);
            }

            if (stadium.Images.Count + files.Count > 10)
            {
                return new BaseResponse<List<StadiumImageDto>>(
                    "A stadium can have a maximum of 10 images.",
                    HttpStatusCode.BadRequest);
            }

            var uploadedPaths = await _fileService.UploadAsync(files);

            var response = new List<StadiumImageDto>();

            foreach (var path in uploadedPaths)
            {
                var image = new StadiumImage
                {
                    StadiumId = stadium.Id,
                    ImageUrl = path,
                    IsMain = !stadium.Images.Any(),
                    Order = stadium.Images.Count
                };

                await _imageRepository.AddAsync(image);

                stadium.Images.Add(image);

                response.Add(new StadiumImageDto
                {
                    Id = image.Id,
                    ImageUrl = image.ImageUrl,
                    IsMain = image.IsMain,
                    Order = image.Order
                });
            }

            await _imageRepository.SaveChangeAsync();

            return new BaseResponse<List<StadiumImageDto>>(
                response,
                "Images uploaded successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<object>> DeleteImageAsync(Guid imageId)
        {
            var image = await _imageRepository
                .GetByFiltered(
                    x => x.Id == imageId,
                    include:
                    [
                        x => x.Stadium,
                x => x.Stadium.StadiumOwnerProfile
                    ])
                .FirstOrDefaultAsync();

            if (image is null)
            {
                return new BaseResponse<object>(
                    "Image not found.",
                    HttpStatusCode.NotFound);
            }

            if (!await _businessAccess.CanManageStadiumAsync(image.StadiumId))
            {
                return new BaseResponse<object>(
                    "You are not authorized to delete this image.",
                    HttpStatusCode.Forbidden);
            }

            var stadiumImages = await _imageRepository
                .GetByFiltered(x => x.StadiumId == image.StadiumId)
                .OrderBy(x => x.Order)
                .ToListAsync();

            if (image.IsMain)
            {
                var newMain = stadiumImages.FirstOrDefault(x => x.Id != image.Id);

                if (newMain != null)
                {
                    newMain.IsMain = true;
                    _imageRepository.Update(newMain);
                }
            }

            int order = 0;

            foreach (var item in stadiumImages.Where(x => x.Id != image.Id))
            {
                item.Order = order++;
                _imageRepository.Update(item);
            }

            _imageRepository.Delete(image);

            await _imageRepository.SaveChangeAsync();

            await _fileService.DeleteAsync(image.ImageUrl);

            return new BaseResponse<object>(
                null,
                "Image deleted successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<object>> SetMainImageAsync(Guid imageId)
        {
            var image = await _imageRepository
                .GetByFiltered(
                    x => x.Id == imageId,
                    include:
                    [
                        x => x.Stadium,
                x => x.Stadium.StadiumOwnerProfile
                    ])
                .FirstOrDefaultAsync();

            if (image is null)
            {
                return new BaseResponse<object>(
                    "Image not found.",
                    HttpStatusCode.NotFound);
            }

            if (!await _businessAccess.CanManageStadiumAsync(image.StadiumId))
            {
                return new BaseResponse<object>(
                    "You are not authorized to update this image.",
                    HttpStatusCode.Forbidden);
            }

            var images = await _imageRepository
                .GetByFiltered(x => x.StadiumId == image.StadiumId)
                .ToListAsync();

            var currentMain = images.FirstOrDefault(x => x.IsMain);

            if (currentMain != null && currentMain.Id != image.Id)
            {
                currentMain.IsMain = false;
                _imageRepository.Update(currentMain);
            }

            if (!image.IsMain)
            {
                image.IsMain = true;
                _imageRepository.Update(image);
            }

            await _imageRepository.SaveChangeAsync();

            return new BaseResponse<object>(
                null,
                "Main image updated successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<List<StadiumImageDto>>> GetByStadiumIdAsync(Guid stadiumId)
        {
            var images = await _imageRepository
                .GetByFiltered(x => x.StadiumId == stadiumId)
                .OrderBy(x => x.Order)
                .Select(x => new StadiumImageDto
                {
                    Id = x.Id,
                    
                    ImageUrl = x.ImageUrl,
                    IsMain = x.IsMain,
                    Order = x.Order
                })
                .ToListAsync();

            return new BaseResponse<List<StadiumImageDto>>(
                images,
                "Images retrieved successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<object>> ReorderImagesAsync(StadiumImagesReorderDto dto)
        {
            var stadium = await _stadiumRepository
                .GetByFiltered(
                    x => x.Id == dto.StadiumId,
                    include:
                    [
                        x => x.StadiumOwnerProfile
                    ])
                .FirstOrDefaultAsync();

            if (stadium is null)
            {
                return new BaseResponse<object>(
                    "Stadium not found.",
                    HttpStatusCode.NotFound);
            }

            if (!await _businessAccess.CanManageStadiumAsync(dto.StadiumId))
            {
                return new BaseResponse<object>(
                    "You are not authorized.",
                    HttpStatusCode.Forbidden);
            }

            var images = await _imageRepository
                .GetByFiltered(x => x.StadiumId == dto.StadiumId)
                .ToListAsync();

            if (images.Count != dto.Images.Count)
            {
                return new BaseResponse<object>(
                    "Invalid image list.",
                    HttpStatusCode.BadRequest);
            }
            var orders = dto.Images
    .Select(x => x.Order)
    .ToList();

            if (orders.Distinct().Count() != orders.Count)
            {
                return new BaseResponse<object>(
                    "Duplicate order values are not allowed.",
                    HttpStatusCode.BadRequest);
            }

            if (orders.Min() != 0 || orders.Max() != dto.Images.Count - 1)
            {
                return new BaseResponse<object>(
                    "Invalid order values.",
                    HttpStatusCode.BadRequest);
            }

            foreach (var image in images)
            {
                var newOrder = dto.Images
                    .FirstOrDefault(x => x.ImageId == image.Id);

                if (newOrder == null)
                {
                    return new BaseResponse<object>(
                        "Invalid image list.",
                        HttpStatusCode.BadRequest);
                }

                image.Order = newOrder.Order;

                _imageRepository.Update(image);
            }

            await _imageRepository.SaveChangeAsync();

            return new BaseResponse<object>(
                null,
                "Images reordered successfully.",
                HttpStatusCode.OK);
        }




    }
}
