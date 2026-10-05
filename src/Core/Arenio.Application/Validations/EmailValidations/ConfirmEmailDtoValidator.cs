using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Validations.EmailValidations
{
    using Arenio.Application.DTOs.EmailDtos;
    using FluentValidation;

    public class ConfirmEmailDtoValidator : AbstractValidator<ConfirmEmailDto>
    {
        public ConfirmEmailDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage("Email boş ola bilməz.")
                .EmailAddress()
                .WithMessage("Düzgün email formatı daxil edin.");

            RuleFor(x => x.OtpCode)
                .NotEmpty()
                .WithMessage("OTP kodu boş ola bilməz.")
                .Length(6)
                .WithMessage("OTP kodu 6 rəqəm olmalıdır.")
                .Matches(@"^\d{6}$")
                .WithMessage("OTP kodu yalnız rəqəmlərdən ibarət olmalıdır.");
        }
    }
}
