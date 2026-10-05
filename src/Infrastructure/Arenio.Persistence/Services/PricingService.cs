using Arenio.Application.Abstracts.Helpers;
using Arenio.Application.Abstracts.Services;
using Arenio.Application.Settings;
using Arenio.Persistence.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Services
{
    public class PricingService : IPricingService
    {
        private readonly ArenioDbContext _context;

        public PricingService(ArenioDbContext context)
        {
            _context = context;
        }

        public async Task<decimal> CalculateAsync(Guid stadiumId, DateTime start, DateTime end)
        {
            var stadium = await _context.Stadiums.FindAsync(stadiumId);
            if (stadium == null)
                return 0;

            var hours = (decimal)(end - start).TotalHours;

            var price = stadium.PricePerHour * hours;

            // Pik saat qaydası (18:00–22:00) Bakı YERLİ saatına aiddir.
            // `start` UTC gəldiyi üçün əvvəlcə Bakı saatına çevrilir.
            var startBakuHour = DateTimeHelper.ToBaku(start).Hour;

            if (startBakuHour >= 18 && startBakuHour < 22)
                price *= 1.5m;

            return price;
        }
    }
}
