using Arenio.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Arenio.WebAPI.Middlewares
{
    public class UserBlockMiddleware
    {
        private readonly RequestDelegate _next;

        public UserBlockMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(
            HttpContext context,
            UserManager<User> userManager)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var user = await userManager.GetUserAsync(context.User);

                if (user != null && user.IsBlocked)
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;

                    await context.Response.WriteAsJsonAsync(new
                    {
                        Message = "Your account has been blocked."
                    });

                    return;
                }
            }

            await _next(context);
        }
    }
}
