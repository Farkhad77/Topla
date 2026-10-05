using Arenio.Application.Abstracts.Helpers;
using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.RoleDtos;
using Arenio.Application.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Arenio.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private IRoleService _roleService { get; }
        private readonly RoleManager<IdentityRole> _roleManager;
        public RolesController(IRoleService roleService, RoleManager<IdentityRole> roleManager)
        {
            _roleService = roleService;
            _roleManager = roleManager;
        }
        [HttpGet("permissions")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetAllPermissions()
        {
            var permissions = PermissionHelper.GetAllPermissions();
            return Ok(permissions);
        }
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateRole(RoleCreateDto dto)
        {
            var result = await _roleService.CreateRole(dto);
            return StatusCode((int)result.StatusCode, result);
        }
        [HttpDelete("delete")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteRole([FromBody] RoleDeleteDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.RoleId))
                return BadRequest("Role Id is required.");

            var role = await _roleManager.FindByNameAsync(dto.RoleId);
            if (role == null)
                return NotFound($"Role with Id '{dto.RoleId}' not found.");

            var result = await _roleManager.DeleteAsync(role);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok($"Role '{dto.RoleId}' has been deleted.");
        }
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public IActionResult GetAllRoles()
        {
            var roles = _roleManager.Roles.Select(r => new { r.Id, r.Name }).ToList();
            return Ok(roles);
        }
        [HttpPut("add-permissions")]
        //[Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddPermissions([FromBody] RoleUpdateDto dto)
        {
            var response = await _roleService.RoleUpdateAsync(dto);
            return StatusCode((int)response.StatusCode, response);
        }

    }
}
