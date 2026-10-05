using Arenio.Application.Settings;
using System.Net;
using System.Text.Json;

namespace Arenio.WebAPI.Middlewares
{
    /// <summary>
    /// Bütün tutulmamış istisnaları tutub vahid BaseResponse formatında qaytarır.
    /// Stack trace-in cliyentə sızmasının qarşısını alır.
    /// </summary>
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (FluentValidation.ValidationException ex)
            {
                // Biznes/validasiya xətaları (məs. şəkil ölçüsü/formatı) 500 kimi
                // maskalanmasın — istifadəçi real səbəbi görsün.
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                context.Response.ContentType = "application/json";

                var badRequest = new BaseResponse<string?>(
                    ex.Message,
                    HttpStatusCode.BadRequest);

                await context.Response.WriteAsync(JsonSerializer.Serialize(badRequest));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception for {Path}", context.Request.Path);

                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                context.Response.ContentType = "application/json";

                var response = new BaseResponse<string?>(
                    "An unexpected error occurred. Please try again later.",
                    HttpStatusCode.InternalServerError);

                var json = JsonSerializer.Serialize(response);

                await context.Response.WriteAsync(json);
            }
        }
    }
}
