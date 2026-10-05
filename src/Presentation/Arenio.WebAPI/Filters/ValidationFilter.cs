using Arenio.Application.Settings;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Net;

namespace Arenio.WebAPI.Filters
{
    /// <summary>
    /// Action argument-ləri üçün qeydiyyatdan keçmiş FluentValidation validator-larını
    /// avtomatik icra edir. Uyğun validator yoxdursa argument atlanılır.
    /// </summary>
    public class ValidationFilter : IAsyncActionFilter
    {
        private readonly IServiceProvider _serviceProvider;

        public ValidationFilter(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task OnActionExecutionAsync(
            ActionExecutingContext context,
            ActionExecutionDelegate next)
        {
            foreach (var argument in context.ActionArguments.Values)
            {
                if (argument is null)
                    continue;

                var validatorType = typeof(IValidator<>)
                    .MakeGenericType(argument.GetType());

                if (_serviceProvider.GetService(validatorType) is not IValidator validator)
                    continue;

                var validationContext = new ValidationContext<object>(argument);

                var result = await validator.ValidateAsync(validationContext);

                if (!result.IsValid)
                {
                    var errors = string.Join(
                        " | ",
                        result.Errors.Select(e => e.ErrorMessage));

                    var response = new BaseResponse<string?>(
                        errors,
                        HttpStatusCode.BadRequest);

                    context.Result = new ObjectResult(response)
                    {
                        StatusCode = (int)HttpStatusCode.BadRequest
                    };

                    return;
                }
            }

            await next();
        }
    }
}
