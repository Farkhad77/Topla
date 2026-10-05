using Arenio.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Distributed;
using System.Security.Claims;

namespace Arenio.WebAPI.Middlewares
{
    public class TokenBlacklistMiddleware
    {
        private readonly RequestDelegate _next;

        public TokenBlacklistMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(
    HttpContext context,
    IDistributedCache cache,
    UserManager<User> userManager)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (!string.IsNullOrEmpty(token))
            {
                var isBlacklisted = await cache.GetStringAsync($"blacklist_{token}");
                if (!string.IsNullOrEmpty(isBlacklisted))
                {
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsync("Token invalid");
                    return;
                }
            }
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
                var tokenSecurityStamp = context.User.FindFirst("security_stamp")?.Value;

                if (!string.IsNullOrEmpty(userId))
                {
                    var user = await userManager.FindByIdAsync(userId);

                    if (user == null)
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        await context.Response.WriteAsync("User not found.");
                        return;
                    }

                    var currentSecurityStamp = await userManager.GetSecurityStampAsync(user);

                    if (tokenSecurityStamp != currentSecurityStamp)
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        await context.Response.WriteAsync("Token is no longer valid.");
                        return;
                    }
                }
            }

            await _next(context);
        }
    }
}
