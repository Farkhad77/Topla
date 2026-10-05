using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Validations.ReviewValidations
{
    using Arenio.Application.DTOs.ReviewDtos;
    using FluentValidation;

    public class ReviewCreateDtoValidator
        : AbstractValidator<ReviewCreateDto>
    {
        public ReviewCreateDtoValidator()
        {
            RuleFor(x => x.StadiumId)
                .NotEmpty()
                .WithMessage("StadiumId boş ola bilməz.");

            RuleFor(x => x.Rating)
                .InclusiveBetween(1, 5)
                .WithMessage("Rating 1 ilə 5 arasında olmalıdır.");

            RuleFor(x => x.Comment)
                .NotEmpty()
                .WithMessage("Comment boş ola bilməz.")
                .MinimumLength(3)
                .WithMessage("Comment minimum 3 simvol olmalıdır.")
                .MaximumLength(1000)
                .WithMessage("Comment maksimum 1000 simvol ola bilər.");
        }
    }

}
