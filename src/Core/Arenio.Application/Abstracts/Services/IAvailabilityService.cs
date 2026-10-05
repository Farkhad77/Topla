using Arenio.Application.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Services
{
    public  interface IAvailabilityService
    {
        Task<BaseResponse<bool>> CanBookAsync(Guid stadiumId, DateTime start, int durationMinutes);

        Task<BaseResponse<bool>> IsAvailableAsync(Guid stadiumId, DateTime start, DateTime end);
    }
}
