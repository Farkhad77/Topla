using Arenio.Application.Settings;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.BookingDtos;

namespace Arenio.Persistence.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;

        public EmailService(IOptions<EmailSettings> settings)
        {
            _settings = settings.Value;
        }

        public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = false)
        {
            using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(_settings.SmtpUser, _settings.SmtpPass)
            };

            var mail = new MailMessage
            {
                From = new MailAddress(_settings.From),
                Subject = subject,
                Body = body,
                IsBodyHtml = isHtml
            };

            mail.To.Add(to);

            await client.SendMailAsync(mail);
        }
        public async Task SendBookingRejectedEmailAsync(BookingRejectedEventDto dto)
        {
            var subject = "Booking Rejected";

            var body = $@"
Hello {dto.UserName},

Unfortunately, your booking request has been rejected.

Stadium: {dto.StadiumName}
Booking Date: {dto.BookingDate:dd.MM.yyyy HH:mm}

Reason:
{dto.RejectReason}

Regards,
Arenio Team";

            await SendEmailAsync(dto.Email, subject, body);
        }
        public async Task SendBookingDeletedEmailAsync(
    BookingDeletedEventDto dto)
        {
            var body = $@"
        Salam {dto.UserName},

        '{dto.StadiumName}' stadionu üçün
        {dto.BookingDate:dd.MM.yyyy HH:mm}
        tarixində olan rezervasiyanız administrator tərəfindən ləğv edilmişdir.

        Əlavə suallarınız olarsa bizimlə əlaqə saxlaya bilərsiniz.
    ";

            await SendEmailAsync(
                dto.Email,
                "Booking Deleted",
                body);
        }
    }
}
