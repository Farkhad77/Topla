using Arenio.Application.Abstracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Arenio.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        /// <summary>
        /// Owner/işçi üçün biznes analitikası.
        /// FromDate/ToDate Bakı təqvim tarixləridir (yyyy-MM-dd); boşdursa son 6 ay.
        /// </summary>
        [HttpGet("owner")]
        [Authorize(Roles = "Owner,Worker")]
        public async Task<IActionResult> GetOwnerAnalytics(
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            CancellationToken cancellationToken)
        {
            var response = await _analyticsService.GetOwnerAnalyticsAsync(
                fromDate,
                toDate,
                cancellationToken);

            return StatusCode((int)response.StatusCode, response);
        }

        /// <summary>
        /// Admin/Moderator üçün platforma analitikası.
        /// FromDate/ToDate Bakı təqvim tarixləridir (yyyy-MM-dd); boşdursa son 6 ay.
        /// </summary>
        [HttpGet("platform")]
        [Authorize(Roles = "Moderator,Admin")]
        public async Task<IActionResult> GetPlatformAnalytics(
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            CancellationToken cancellationToken)
        {
            var response = await _analyticsService.GetPlatformAnalyticsAsync(
                fromDate,
                toDate,
                cancellationToken);

            return StatusCode((int)response.StatusCode, response);
        }
    }
}
