using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Arenio.Application.Abstracts.Helpers;
using Arenio.Application.DTOs.BookingDtos;
using FluentValidation;
using System.Threading.Tasks;
using Arenio.Application.Abstracts.Services;

namespace Arenio.Application.Validations.BookingValidations
{

    public class BookingCreateDtoValidator : AbstractValidator<BookingCreateDto>
    {

        private readonly IStadiumService _stadiumService;
        public BookingCreateDtoValidator(IStadiumService stadiumService)
        {
            _stadiumService = stadiumService;

            RuleFor(x => x.StadiumId)
                .NotEmpty()
                .WithMessage("StadiumId boş ola bilməz.");

            RuleFor(x => x.StartDateTime)
                .NotEmpty()
                .WithMessage("Başlanğıc vaxtı qeyd edilməlidir.")
                .Must(start => DateTimeHelper.ToUtc(start) > DateTime.UtcNow)
                .WithMessage("Booking keçmiş tarixə yaradıla bilməz.");
            RuleFor(x => x.DurationMinutes)
            .GreaterThan(0)
            .WithMessage("Booking müddəti 0-dan böyük olmalıdır.")
            // Yalnız tam saatlar qəbul olunur (60, 120, 180, ...).
            .Must(duration => duration % 60 == 0)
            .WithMessage("Booking müddəti yalnız tam saatlarla ola bilər (1 saat, 2 saat, 3 saat...).")
            .MustAsync(async (dto, duration, cancellationToken) =>
            {
                var response = await _stadiumService.GetById(dto.StadiumId);

                if (response == null || response.Data == null)
                    return false;

                var stadium = response.Data;

                return duration >= stadium.MinBookingMinutes &&
                       duration <= stadium.MaxBookingMinutes;
            })
            .WithMessage(
                "Booking müddəti stadionun təyin etdiyi minimum və maksimum müddət arasında olmalıdır.");
        }
    }
}
