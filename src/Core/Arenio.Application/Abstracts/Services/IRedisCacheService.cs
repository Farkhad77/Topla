using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Services
{
    public interface IRedisCacheService
    {
        Task<T?> GetAsync<T>(string key);

        Task SetAsync<T>(
            string key,
            T value,
            TimeSpan expiration);

        Task RemoveAsync(string key);

        Task RemoveByPrefixAsync(string prefix);
    }
}
