using Arenio.Application.DTOs.BookingDtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body, bool isHtml = false);
        Task SendBookingRejectedEmailAsync(BookingRejectedEventDto dto);
        Task SendBookingDeletedEmailAsync(BookingDeletedEventDto dto);
    }
}
