using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Validations.StadiumValidations
{
    using Arenio.Application.DTOs.StadiumDtos;
    using FluentValidation;

    public class StadiumUpdateDtoValidator : AbstractValidator<StadiumUpdateDto>
    {
        public StadiumUpdateDtoValidator()
        {
            RuleFor(x => x.StadiumId)
                .NotEmpty()
                .WithMessage("StadiumId boş ola bilməz.");

            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Stadium adı boş ola bilməz.")
                .MinimumLength(2)
                .MaximumLength(100);

            RuleFor(x => x.Description)
                .NotEmpty()
                .WithMessage("Description boş ola bilməz.")
                .MaximumLength(2000);

            RuleFor(x => x.City)
                .NotEmpty()
                .WithMessage("Şəhər boş ola bilməz.")
                .MaximumLength(100);

            RuleFor(x => x.Address)
                .NotEmpty()
                .WithMessage("Address boş ola bilməz.")
                .MaximumLength(300);

            RuleFor(x => x.Latitude)
                .InclusiveBetween(-90, 90)
                .WithMessage("Latitude -90 ilə 90 arasında olmalıdır.");

            RuleFor(x => x.Longitude)
                .InclusiveBetween(-180, 180)
                .WithMessage("Longitude -180 ilə 180 arasında olmalıdır.");

            RuleFor(x => x.PricePerHour)
                .GreaterThan(0)
                .WithMessage("Saatlıq qiymət 0-dan böyük olmalıdır.");

            RuleFor(x => x.Size)
                .NotEmpty()
                .WithMessage("Stadium ölçüsü boş ola bilməz.")
                .Must(x => x is "5x5" or "6x6" or "7x7" or "8x8" or "11x11")
                .WithMessage("Stadium ölçüsü yalnız 5x5, 6x6, 7x7, 8x8 və ya 11x11 ola bilər.");

            RuleFor(x => x.SurfaceType)
                .NotEmpty()
                .WithMessage("SurfaceType boş ola bilməz.")
                .MaximumLength(100);

            RuleFor(x => x.CloseTime)
                .GreaterThan(x => x.OpenTime)
                .WithMessage("CloseTime OpenTime-dan sonra olmalıdır.");

            RuleFor(x => x.MinBookingMinutes)
                .GreaterThan(0)
                .WithMessage("Minimum booking müddəti 0-dan böyük olmalıdır.");

            RuleFor(x => x.MaxBookingMinutes)
                .GreaterThan(0)
                .WithMessage("Maximum booking müddəti 0-dan böyük olmalıdır.");

            RuleFor(x => x)
                .Must(x => x.MinBookingMinutes <= x.MaxBookingMinutes)
                .WithMessage("Minimum booking müddəti maximum booking müddətindən böyük ola bilməz.");
        }
    }
}
