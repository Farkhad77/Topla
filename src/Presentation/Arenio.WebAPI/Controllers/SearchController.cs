using Arenio.Application.Abstracts.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Arenio.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        // Elasticsearch layihədən çıxarılıb — axtarış birbaşa PostgreSQL
        // üzərində aparılır (StadiumService.SearchAsync). Cavab forması
        // əvvəlki ilə eynidir, frontend dəyişmir.
        private readonly IStadiumService _stadiumService;

        public SearchController(IStadiumService stadiumService)
        {
            _stadiumService = stadiumService;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(
            string q,
            CancellationToken cancellationToken)
        {
            var result = await _stadiumService.SearchAsync(q, cancellationToken);

            return Ok(result);
        }
    }
}
