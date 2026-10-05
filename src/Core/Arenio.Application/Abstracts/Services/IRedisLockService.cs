using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Services
{
    public interface IRedisLockService
    {
        // Uğurlu olduqda lock token qaytarır, əks halda null
        Task<string?> AcquireLockAsync(string key, TimeSpan expiry);

        // Yalnız token uyğun gələrsə lock-u açır (başqasının lock-unu silmir)
        Task ReleaseLockAsync(string key, string token);
    }
}
