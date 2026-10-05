using Arenio.Application.DTOs.BookingDtos;
using Arenio.Application.Settings;
using Arenio.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Services
{
    public interface IBookingService
    {
        Task<BaseResponse<string?>> CreateBookingAsync(BookingCreateDto dto);

        Task<BaseResponse<bool>> CancelBookingAsync(Guid id);

        Task<BaseResponse<List<BookingDto>>> GetUserBookingsAsync(string userId);

        Task<BaseResponse<BookingDto?>> GetByIdAsync(Guid id);
        Task<BaseResponse<List<BookingGetMyDto>>> GetMyBookingsAsync();
        Task<BaseResponse<string?>> DeleteBookingAsync(Guid bookingId);
        // Task<BaseResponse<string?>> DeleteMyBookingAsync(Guid bookingId);
        Task<BaseResponse<string?>> RejectBookingAsync(
    Guid bookingId,
    BookingRejectDto dto);
        Task<PagedResult<BookingDto>> GetAllBookingsAsync(
     PaginationRequest request,
     CancellationToken cancellationToken);
        Task<BaseResponse<List<BookingAvailableSlotsDto>>> GetAvailableSlotsAsync(
    Guid stadiumId,
    DateOnly date);
        Task<BaseResponse<BookingPreviewDto>> PreviewAsync(
      BookingPreviewRequestDto dto);

    }
}
