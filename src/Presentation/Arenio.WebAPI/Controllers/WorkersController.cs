using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.WorkerDtos;
using Arenio.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Arenio.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkersController : ControllerBase
    {
        private readonly IWorkerService _workerService;

        public WorkersController(IWorkerService workerService)
        {
            _workerService = workerService;
        }

        // Owner: işçini biznesə təyin edir
        [HttpPost("assign")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Assign([FromBody] AssignWorkerDto dto)
        {
            var result = await _workerService.AssignWorkerAsync(dto);
            return StatusCode((int)result.StatusCode, result);
        }

        // Owner: işçi təyinatını ləğv edir
        [HttpDelete("{workerUserId}")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Remove(string workerUserId)
        {
            var result = await _workerService.RemoveWorkerAsync(workerUserId);
            return StatusCode((int)result.StatusCode, result);
        }

        // Owner: biznesimin işçiləri
        [HttpGet]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> GetMyWorkers()
        {
            var result = await _workerService.GetMyWorkersAsync();
            return StatusCode((int)result.StatusCode, result);
        }

        // Worker: aid olduğum biznes və stadionlar
        [HttpGet("my-business")]
        [Authorize(Roles = "Worker")]
        public async Task<IActionResult> GetMyBusiness()
        {
            var result = await _workerService.GetMyBusinessAsync();
            return StatusCode((int)result.StatusCode, result);
        }
    }
}
