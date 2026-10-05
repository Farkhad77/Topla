using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Validations.RequestValidations
{
    using Arenio.Application.DTOs.RequestDtos;
    using FluentValidation;

    public class RequestCreateOwnerDtoValidator
        : AbstractValidator<RequestCreateOwnerDto>
    {
        public RequestCreateOwnerDtoValidator()
        {
            RuleFor(x => x.Message)
                .MaximumLength(1000)
                .WithMessage("Mesaj maksimum 1000 simvol ola bilər.")
                .When(x => !string.IsNullOrWhiteSpace(x.Message));
        }
    }
}
