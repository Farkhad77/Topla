using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Arenio.Application.Abstracts.Services;
using StackExchange.Redis;
namespace Arenio.Persistence.Services
{
   

    public class ForgotPasswordRateLimiterService : IForgotPasswordRateLimiterService
    {
        private readonly IConnectionMultiplexer _redis;

        public ForgotPasswordRateLimiterService(IConnectionMultiplexer redis)
        {
            _redis = redis;
        }

        public async Task<bool> IsAllowedAsync(string email)
        {
            var db = _redis.GetDatabase();

            var key = $"forgot-password:{email.ToLower()}";

            var count = await db.StringIncrementAsync(key);

            if (count == 1)
            {
                await db.KeyExpireAsync(key, TimeSpan.FromMinutes(10));
            }

            return count <= 3;
        }
    }
}
