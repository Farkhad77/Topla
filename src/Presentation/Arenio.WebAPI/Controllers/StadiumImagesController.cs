using Arenio.Persistence.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Arenio.WebAPI.Controllers
{
    using Arenio.Application.DTOs.StadiumImagesDtos;
    using Arenio.Persistence.Abstracts;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/[controller]")]
    [ApiController]
    public class StadiumImageController : ControllerBase
    {
        private readonly IStadiumImageService _stadiumImageService;

        public StadiumImageController(IStadiumImageService stadiumImageService)
        {
            _stadiumImageService = stadiumImageService;
        }

        /// <summary>
        /// Upload stadium images
        /// </summary>
        [HttpPost("{stadiumId:guid}")]
        [Authorize(Roles = "Owner,Worker")]
        public async Task<IActionResult> UploadImages(
            Guid stadiumId,
            [FromForm] List<IFormFile> files)
        {
            var result = await _stadiumImageService
                .UploadImagesAsync(stadiumId, files);

            return StatusCode((int)result.StatusCode, result);
        }

        /// <summary>
        /// Get all images of a stadium
        /// </summary>
        [HttpGet("{stadiumId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByStadium(Guid stadiumId)
        {
            var result = await _stadiumImageService
                .GetByStadiumIdAsync(stadiumId);

            return StatusCode((int)result.StatusCode, result);
        }

        /// <summary>
        /// Delete image
        /// </summary>
        [HttpDelete("{imageId:guid}")]
        [Authorize(Roles = "Owner,Worker")]
        public async Task<IActionResult> Delete(Guid imageId)
        {
            var result = await _stadiumImageService
                .DeleteImageAsync(imageId);

            return StatusCode((int)result.StatusCode, result);
        }

        /// <summary>
        /// Set main image
        /// </summary>
        [HttpPut("{imageId:guid}/set-main")]
        [Authorize(Roles = "Owner,Worker")]
        public async Task<IActionResult> SetMain(Guid imageId)
        {
            var result = await _stadiumImageService
                .SetMainImageAsync(imageId);

            return StatusCode((int)result.StatusCode, result);
        }
        /// <summary>
        /// Reorder stadium images
        /// </summary>
        [HttpPut("reorder")]
        [Authorize(Roles = "Owner,Worker")]
        public async Task<IActionResult> ReorderImages(
            StadiumImagesReorderDto dto)
        {
            var result = await _stadiumImageService
                .ReorderImagesAsync(dto);

            return StatusCode((int)result.StatusCode, result);
        }
    }
}
