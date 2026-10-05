using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.BookingDtos;
using Arenio.Application.Settings;
using Arenio.Persistence.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Arenio.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(BookingCreateDto dto)
        {
            var result = await _bookingService.CreateBookingAsync(dto);

            return StatusCode((int)result.StatusCode, result);
        }

        //Oz bookingini silmek
        [HttpPost("cancel/{id}")]
        [Authorize]
        public async Task<IActionResult> Cancel(Guid id)
        {
            var result = await _bookingService.CancelBookingAsync(id);
            return Ok(result);
        }

        [HttpGet("user/{userId}")]
        [Authorize(Roles ="Admin,Moderator")]
        public async Task<IActionResult> GetUserBookings(string userId)
        {
            var result = await _bookingService.GetUserBookingsAsync(userId);
            return Ok(result);
        }
        [Authorize(Roles = "Admin,Moderator")]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _bookingService.GetByIdAsync(id);
            return StatusCode((int)result.StatusCode, result);
        }

        [Authorize]
        [HttpGet("my-bookings")]
        public async Task<IActionResult> GetMyBookings()
        {
            var result = await _bookingService.GetMyBookingsAsync();
            return StatusCode((int)result.StatusCode, result);
        }


        [Authorize(Roles = "Admin,Moderator")]
        [HttpGet]
        public async Task<IActionResult> GetAllBookings(
        [FromQuery] PaginationRequest request,
        CancellationToken cancellationToken)
        {
            var result = await _bookingService.GetAllBookingsAsync(
                request,
                cancellationToken);

            return Ok(result);
        }

        // Admin və Moderator booking silir
        [Authorize(Roles = "Admin,Moderator")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteBooking(Guid id)
        {
            var result = await _bookingService.DeleteBookingAsync(id);
            return StatusCode((int)result.StatusCode, result);
        }



        // Stadion sahibi booking reject edir
        [Authorize(Roles = "Owner")]
        [HttpPatch("{id:guid}/reject")]
        public async Task<IActionResult> RejectBooking(Guid id, BookingRejectDto dto)
        {
            var result = await _bookingService.RejectBookingAsync(id,dto);
            return StatusCode((int)result.StatusCode, result);
        }
        [HttpGet("available-slots")]
        public async Task<IActionResult> GetAvailableSlots(
    [FromQuery] Guid stadiumId,
    [FromQuery] DateOnly date)
        {
            var result = await _bookingService.GetAvailableSlotsAsync(
                stadiumId,
                date);

            return StatusCode((int)result.StatusCode, result);
        }
        [Authorize]
        [HttpPost("preview")]
        public async Task<IActionResult> Preview(
    [FromBody] BookingPreviewRequestDto dto)
        {
            var response = await _bookingService
                .PreviewAsync(dto);

            return StatusCode(
                (int)response.StatusCode,
                response);
        }
    }
}

