using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Validations.RequestValidations
{
    using Arenio.Application.DTOs.RequestDtos;
    using FluentValidation;

    public class RequestRejectDtoValidator
        : AbstractValidator<RequestRejectDto>
    {
        public RequestRejectDtoValidator()
        {
            RuleFor(x => x.Reason)
                .NotEmpty()
                .WithMessage("Reject səbəbi boş ola bilməz.")
                .MinimumLength(3)
                .WithMessage("Reject səbəbi minimum 3 simvol olmalıdır.")
                .MaximumLength(500)
                .WithMessage("Reject səbəbi maksimum 500 simvol ola bilər.");
        }
    }
}
