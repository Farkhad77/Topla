using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Validations.BookingValidations
{
    using Arenio.Application.DTOs.BookingDtos;
    using FluentValidation;

    public class BookingRejectDtoValidator
        : AbstractValidator<BookingRejectDto>
    {
        public BookingRejectDtoValidator()
        {
            RuleFor(x => x.RejectReason)
                .NotEmpty()
                .WithMessage("Reject reason boş ola bilməz.")
                .MaximumLength(500)
                .WithMessage("Reject reason maksimum 500 simvol ola bilər.")
                .MinimumLength(3)
                .WithMessage("Reject reason minimum 3 simvol olmalıdır.");
        }
    }
}
