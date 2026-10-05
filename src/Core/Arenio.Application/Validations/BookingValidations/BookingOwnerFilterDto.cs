using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Validations.BookingValidations
{
    using Arenio.Application.DTOs.BookingDtos;
    using FluentValidation;

    public class BookingOwnerFilterDtoValidator
        : AbstractValidator<BookingOwnerFilterDto>
    {
        public BookingOwnerFilterDtoValidator()
        {
            RuleFor(x => x.PageNumber)
                .GreaterThanOrEqualTo(1)
                .WithMessage("PageNumber minimum 1 olmalıdır.");

            RuleFor(x => x.PageSize)
                .InclusiveBetween(1, 100)
                .WithMessage("PageSize 1 ilə 100 arasında olmalıdır.");

            RuleFor(x => x)
                .Must(x => !x.FromDate.HasValue ||
                           !x.ToDate.HasValue ||
                           x.FromDate <= x.ToDate)
                .WithMessage("FromDate ToDate-dan böyük ola bilməz.");

            RuleFor(x => x.StadiumId)
                .Must(id => !id.HasValue || id.Value != Guid.Empty)
                .WithMessage("StadiumId düzgün deyil.");
        }
    }
}
