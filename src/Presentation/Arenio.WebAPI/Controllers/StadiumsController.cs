using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.BookingDtos;
using Arenio.Application.DTOs.StadiumBlockedSlotDtos;
using Arenio.Application.DTOs.StadiumDtos;
using Arenio.Application.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Arenio.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StadiumsController : ControllerBase
    {
        private readonly IStadiumService _stadiumService;

        public StadiumsController(IStadiumService stadiumService)
        {
            _stadiumService = stadiumService;
        }
        [Authorize(Roles = "Owner")]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] StadiumCreateDto dto)
        {
            var result = await _stadiumService.CreateStadium(dto);
            return StatusCode((int)result.StatusCode, result);
        }

        [Authorize(Roles = "Owner")]
        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] StadiumUpdateDto dto)
        {
            var result = await _stadiumService.UpdateStadiumAsync(dto);
            return StatusCode((int)result.StatusCode, result);
        }

        [Authorize(Roles = "Owner")]
        [HttpDelete("delete")]
        public async Task<IActionResult> Delete([FromBody] StadiumDeleteDto dto)
        {
            var result = await _stadiumService.DeleteStadium(dto);
            return StatusCode((int)result.StatusCode, result);
        }
        [Authorize(Roles = "Owner")]
        [HttpPatch("activate")]
        public async Task<IActionResult> Activate([FromBody] StadiumActivateDto dto)
        {
            var result = await _stadiumService.ActivateStadiumAsync(dto);
            return StatusCode((int)result.StatusCode, result);
        }

        [Authorize(Roles = "Owner")]
        [HttpPatch("deactivate")]
        public async Task<IActionResult> Deactivate([FromBody] StadiumDeactivateDto dto)
        {
            var result = await _stadiumService.DeActivateStadiumAsync(dto);
            return StatusCode((int)result.StatusCode, result);
        }

        [Authorize(Roles = "Admin,Moderator")]
        [HttpPatch("verify")]
        public async Task<IActionResult> Verify([FromBody] StadiumVerifyDto dto)
        {
            var result = await _stadiumService.VerifyStadiumAsync(dto);
            return StatusCode((int)result.StatusCode, result);
        }

        
        [HttpGet("View")]
        public async Task<IActionResult> View(
            [FromQuery] PaginationRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _stadiumService.ViewAsync(request, cancellationToken);
            return Ok(result);
        }

        /// <summary>
        /// Stadionun publik detalı. İcazə tələb etmir — sayt ziyarətçisi də görür.
        /// Cavab Redis-də saxlanılır, stadion yenilənəndə cache avtomatik silinir.
        /// Boş saatlar burada YOXDUR: onlar real-time olduğu üçün
        /// GET /api/Booking/available-slots endpoint-indən alınmalıdır.
        /// </summary>
        [AllowAnonymous]
        [HttpGet("view-detail/{stadiumId:guid}")]
        public async Task<IActionResult> ViewDetail(
            Guid stadiumId,
            CancellationToken cancellationToken)
        {
            var result = await _stadiumService.ViewDetailAsync(stadiumId, cancellationToken);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("{stadiumId:guid}")]
        [Authorize(Roles = "Moderator,Admin,Worker,Owner")]
        public async Task<IActionResult> GetById(Guid stadiumId)
        {
            var result = await _stadiumService.GetById(stadiumId);
            return StatusCode((int)result.StatusCode, result);
        }
        [Authorize(Roles = "Moderator,Admin")]
        [HttpGet("user/{userId}")]
        
        public async Task<IActionResult> GetByUserId(string userId)
        {
            var result = await _stadiumService.GetByUserId(userId);
            return StatusCode((int)result.StatusCode, result);
        }
        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyStadiums()
        {
            var result = await _stadiumService.GetMyStadiums();
            return StatusCode((int)result.StatusCode, result);
        }


        [HttpGet("my-stadiums-bookings")]
        [Authorize(Roles = "Owner,Worker")]
        public async Task<IActionResult> GetMyBookings([FromQuery] BookingOwnerFilterDto filter)
        {
            var response = await _stadiumService.GetMyStadiumBookingsAsync(filter);
            return StatusCode((int)response.StatusCode, response);
        }

        [Authorize(Roles = "Owner,Worker")]
        [HttpPost("stadiums/{stadiumId:guid}/blocked-slots")]
        public async Task<IActionResult> BlockTime(
       Guid stadiumId,
       [FromBody] StadiumBlockedSlotCreateDto dto,
       CancellationToken cancellationToken)
        {
            var response = await _stadiumService.BlockTimeAsync(
                stadiumId,
                dto,
                cancellationToken);

            return StatusCode(
                (int)response.StatusCode,
                response);
        }

        [Authorize(Roles = "Owner,Worker")]
        [HttpGet("stadiums/{stadiumId:guid}/blocked-slots")]
        public async Task<IActionResult> GetBlockedSlots(
            Guid stadiumId,
            CancellationToken cancellationToken)
        {
            var response = await _stadiumService.GetBlockedSlotsAsync(
                stadiumId,
                cancellationToken);

            return StatusCode(
                (int)response.StatusCode,
                response);
        }
        [Authorize(Roles = "Owner,Worker")]



        [HttpDelete("blocked-slots/{blockedSlotId:guid}")]
        public async Task<IActionResult> Unblock(
            Guid blockedSlotId,
            CancellationToken cancellationToken)
        {
            var response = await _stadiumService.UnblockAsync(
                blockedSlotId,
                cancellationToken);

            return StatusCode(
                (int)response.StatusCode,
                response);
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Moderator,Admin")]
        public async Task<ActionResult<BaseResponse<List<StadiumPendingDto>>>> GetPendingStadiums(
    CancellationToken cancellationToken)
        {
            var response = await _stadiumService.GetPendingStadiumsAsync(cancellationToken);

            return StatusCode((int)response.StatusCode, response);
        }

    }
}
