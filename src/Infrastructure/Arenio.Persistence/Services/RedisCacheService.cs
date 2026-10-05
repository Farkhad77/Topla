using Arenio.Application.Abstracts.Services;
using Microsoft.Extensions.Caching.Distributed;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Arenio.Persistence.Services
{
    public class RedisCacheService : IRedisCacheService
    {
        private readonly IDistributedCache _cache;
        private readonly IConnectionMultiplexer _connection;

        public RedisCacheService(
            IDistributedCache cache,
            IConnectionMultiplexer connection)
        {
            _cache = cache;
            _connection = connection;
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            var data = await _cache.GetStringAsync(key);

            if (string.IsNullOrWhiteSpace(data))
                return default;

            try
            {
                return JsonSerializer.Deserialize<T>(data);
            }
            catch (JsonException)
            {
                // Cache-dəki köhnə/uyğunsuz format tətbiqi sındırmamalıdır:
                // zədəli açarı silib DB-dən oxumağa icazə veririk.
                await _cache.RemoveAsync(key);
                return default;
            }
        }

        public async Task SetAsync<T>(
            string key,
            T value,
            TimeSpan expiration)
        {
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration
            };

            await _cache.SetStringAsync(
                key,
                JsonSerializer.Serialize(value),
                options);
        }

        public async Task RemoveAsync(string key)
        {
            await _cache.RemoveAsync(key);
        }

        /// <summary>
        /// Verilmiş prefikslə başlayan bütün açarları silir (məs. "stadiums:view:").
        /// SCAN istifadə olunur — KEYS-dən fərqli olaraq Redis-i bloklamır.
        /// </summary>
        public async Task RemoveByPrefixAsync(string prefix)
        {
            if (string.IsNullOrWhiteSpace(prefix))
                return;

            var database = _connection.GetDatabase();
            var pattern = $"{prefix}*";

            foreach (var endpoint in _connection.GetEndPoints())
            {
                var server = _connection.GetServer(endpoint);

                // Replica node-larda silmə əməliyyatı aparılmır
                if (!server.IsConnected || server.IsReplica)
                    continue;

                await foreach (var key in server.KeysAsync(
                    database: database.Database,
                    pattern: pattern,
                    pageSize: 250))
                {
                    await database.KeyDeleteAsync(key);
                }
            }
        }
    }
}
