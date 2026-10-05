using Arenio.Application.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Services
{
    public interface IPricingService
    {
        Task<decimal> CalculateAsync(Guid stadiumId, DateTime start, DateTime end);
    }
}
