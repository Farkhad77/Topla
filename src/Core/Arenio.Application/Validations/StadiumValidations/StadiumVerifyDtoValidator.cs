using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Validations.StadiumValidations
{
    using Arenio.Application.DTOs.StadiumDtos;
    using Arenio.Domain.Enums;
    using FluentValidation;

    public class StadiumVerifyDtoValidator : AbstractValidator<StadiumVerifyDto>
    {
        public StadiumVerifyDtoValidator()
        {
            RuleFor(x => x.StadiumId)
                .NotEmpty()
                .WithMessage("StadiumId boş ola bilməz.");

            RuleFor(x => x.VerificationStatus)
     .Must(x =>
         x == StadiumVerificationStatus.Verified ||
         x == StadiumVerificationStatus.Rejected)
     .WithMessage("Stadium yalnız Verify və ya Rejected edilə bilər.");
        }
    }
}
