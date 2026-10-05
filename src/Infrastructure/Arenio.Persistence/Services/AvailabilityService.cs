using Arenio.Application.Abstracts.Services;
using Arenio.Application.Settings;
using Arenio.Persistence.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Arenio.Domain.Enums;
namespace Arenio.Persistence.Services
{
    public class AvailabilityService : IAvailabilityService
    {
        private readonly ArenioDbContext _context;

        public AvailabilityService(ArenioDbContext context)
        {
            _context = context;
        }

        public async Task<BaseResponse<bool>> IsAvailableAsync(Guid stadiumId, DateTime start, DateTime end)
        {
            // Ləğv edilməyən hər booking (Pending/Confirmed/Completed) slotu tutur.
            var hasBookingConflict = await _context.Bookings.AnyAsync(x =>
     x.StadiumId == stadiumId &&
     x.Status != BookingStatus.Cancelled &&
     x.StartDateTime < end &&
     x.EndDateTime > start);

            // Owner tərəfindən bloklanmış slot-lar da availability-ni pozur
            var hasBlockedConflict = await _context.StadiumBlockedSlots.AnyAsync(x =>
     x.StadiumId == stadiumId &&
     x.StartTime < end &&
     x.EndTime > start);

            var isAvailable = !hasBookingConflict && !hasBlockedConflict;

            return new BaseResponse<bool>(
     isAvailable,
     "Availability checked",
     HttpStatusCode.OK
 );
        }

        public async Task<BaseResponse<bool>> CanBookAsync(Guid stadiumId, DateTime start, int durationMinutes)
        {
            var end = start.AddMinutes(durationMinutes);

            var result = await IsAvailableAsync(stadiumId, start, end);

            return new BaseResponse<bool>(
                result.Data,
                "OK",
                HttpStatusCode.OK
            );
        }
    }
}
