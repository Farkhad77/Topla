using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.RequestDtos;
using Arenio.Application.DTOs.UserDtos;
using Arenio.Application.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Arenio.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Moderator,Admin")]
    public class ModeratorsController : ControllerBase
    {
        private readonly IModeratorService _moderatorService;

        public ModeratorsController(IModeratorService moderatorService)
        {
            _moderatorService = moderatorService;
        }

        [HttpGet("owner-requests")]
        [Authorize(Roles = "Moderator,Admin")]
        public async Task<IActionResult> GetPendingOwnerRequests(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _moderatorService.GetPendingOwnerRequests(pageNumber, pageSize);

            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("owner-requests/{id:guid}")]
        [Authorize(Roles = "Moderator,Admin")]
        public async Task<IActionResult> GetOwnerRequestById(Guid id)
        {
            var result = await _moderatorService.GetOwnerRequestById(id);

            return StatusCode((int)result.StatusCode, result);
        }

        [HttpPost("owner-requests/{id:guid}/approve")]
        [Authorize(Roles = "Moderator,Admin")]
        public async Task<IActionResult> ApproveOwnerRequest(Guid id)
        {
            var result = await _moderatorService.ApproveOwnerRequest(id);

            return StatusCode((int)result.StatusCode, result);
        }

        [HttpPost("owner-requests/{id:guid}/reject")]
        [Authorize(Roles = "Moderator,Admin")]
        public async Task<IActionResult> RejectOwnerRequest(
            Guid id,
            [FromBody] RequestRejectDto dto)
        {
            var result = await _moderatorService.RejectOwnerRequest(id, dto);

            return StatusCode((int)result.StatusCode, result);
        }

        [HttpPost("users/assign-moderator")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignModerator(
            [FromBody] AssignModeratorDto dto)
        {
            var response = await _moderatorService.AssignModeratorRoleAsync(dto);

            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("users/{userId}/block")]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> BlockUser(
    string userId,
    [FromBody] UserBlockDto dto)
        {
            var response = await _moderatorService.BlockUserAsync(userId, dto);

            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPut("users/{userId}/unblock")]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> UnblockUser(string userId)
        {
            var response = await _moderatorService.UnblockUserAsync(userId);

            return StatusCode((int)response.StatusCode, response);
        }
    }
}
