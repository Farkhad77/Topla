using Arenio.Application.Abstracts.Services;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Services
{
    public class RedisLockService : IRedisLockService
    {
        private readonly IDatabase _redis;

        public RedisLockService(IConnectionMultiplexer redis)
        {
            _redis = redis.GetDatabase();
        }

        public async Task<string?> AcquireLockAsync(string key, TimeSpan expiry)
        {
            var token = Guid.NewGuid().ToString("N");

            var acquired = await _redis.StringSetAsync(key, token, expiry, When.NotExists);

            return acquired ? token : null;
        }

        public async Task ReleaseLockAsync(string key, string token)
        {
            // Compare-and-delete: yalnız lock hələ də bizimdirsə silirik.
            // TTL bitib başqası lock götürübsə, onun lock-unu silmirik.
            const string script = @"
if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1])
else
    return 0
end";

            await _redis.ScriptEvaluateAsync(
                script,
                new RedisKey[] { key },
                new RedisValue[] { token });
        }
    }
}
