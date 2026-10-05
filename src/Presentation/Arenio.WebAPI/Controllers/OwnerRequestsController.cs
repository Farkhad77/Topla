using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.RequestDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Arenio.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OwnerRequestsController : ControllerBase
    {
        private readonly IOwnerRequestService _ownerRequestService;

        public OwnerRequestsController(IOwnerRequestService ownerRequestService)
        {
            _ownerRequestService = ownerRequestService;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(RequestCreateOwnerDto dto)
        {
            var result = await _ownerRequestService.CreateRequest(dto);

            return StatusCode((int)result.StatusCode, result);
        }

        [HttpGet("my-request")]
        [Authorize]
        public async Task<IActionResult> GetMyRequest()
        {
            var result = await _ownerRequestService.GetMyRequest();

            return StatusCode((int)result.StatusCode, result);
        }
    }
}
