using Arenio.Application.DTOs.AnalyticsDtos;
using Arenio.Application.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Services
{
    public interface IAnalyticsService
    {
        /// <summary>
        /// Owner/işçi üçün biznes analitikası. FromDate/ToDate Bakı təqvim
        /// tarixləridir; göndərilməzsə son 6 ay götürülür.
        /// </summary>
        Task<BaseResponse<OwnerAnalyticsDto>> GetOwnerAnalyticsAsync(
            DateTime? fromDate,
            DateTime? toDate,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Admin/Moderator üçün platforma analitikası. FromDate/ToDate Bakı
        /// təqvim tarixləridir; göndərilməzsə son 6 ay götürülür.
        /// </summary>
        Task<BaseResponse<PlatformAnalyticsDto>> GetPlatformAnalyticsAsync(
            DateTime? fromDate,
            DateTime? toDate,
            CancellationToken cancellationToken = default);
    }
}
