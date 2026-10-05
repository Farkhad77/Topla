using Arenio.Application.Abstracts.Helpers;
using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.RoleDtos;
using Arenio.Application.Settings;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using static Arenio.Application.Settings.Permissions;

namespace Arenio.Persistence.Services
{
    public class RoleService : IRoleService
    {
        private readonly UserManager<Arenio.Domain.Entities.User> _userManager;

        private RoleManager<IdentityRole> _roleManager { get; }
      
        public RoleService(RoleManager<IdentityRole> roleManager, UserManager<Arenio.Domain.Entities.User> userManager)
        {
            _roleManager = roleManager;
            _userManager = userManager;
        }

        public async Task<BaseResponse<string?>> CreateRole(RoleCreateDto dto)
        {
            var existingRole = await _roleManager.FindByNameAsync(dto.Name);
            if (existingRole != null)
            {
                return new BaseResponse<string?>("This role already exists", HttpStatusCode.BadRequest);
            }

            var allPermissions = PermissionHelper.GetAllPermissionsList();
            var invalidPermissions = dto.PermissionsList.Except(allPermissions).ToList();

            if (invalidPermissions.Any())
            {
                return new BaseResponse<string?>(
                    $"Invalid permissions: {string.Join(", ", invalidPermissions)}",
                    HttpStatusCode.BadRequest
                );
            }

            var newRole = new IdentityRole(dto.Name);
            var result = await _roleManager.CreateAsync(newRole);

            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new BaseResponse<string?>(errors, HttpStatusCode.BadRequest);
            }

            foreach (var permission in dto.PermissionsList)
            {
                await _roleManager.AddClaimAsync(newRole, new Claim("Permission", permission));
            }

            return new BaseResponse<string?>("Role created successfully", true, HttpStatusCode.Created);
        }
        public async Task<BaseResponse<string?>> DeleteRole(RoleDeleteDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.RoleId))
            {
                return new BaseResponse<string?>("Role Id is required", HttpStatusCode.BadRequest);
            }

            var role = await _roleManager.FindByNameAsync(dto.RoleId);
            if (role == null)
            {
                return new BaseResponse<string?>($"Role with Id '{dto.RoleId}' not found", HttpStatusCode.NotFound);
            }

            var result = await _roleManager.DeleteAsync(role);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return new BaseResponse<string?>(errors, HttpStatusCode.BadRequest);
            }

            return new BaseResponse<string?>($"Role '{dto.RoleId}' has been deleted successfully", true, HttpStatusCode.OK);
        }
      /*  public List<string> GetPermissionsByRoles(List<string> roles)
        {
            var permissions = new List<string>();

            foreach (var role in roles)
            {
                switch (role)
                {
                    case "Admin":

                        permissions.AddRange(BankAccount.All);
                        permissions.AddRange(Transaction.All);
                        permissions.AddRange(Card.All);
                        permissions.AddRange(Role.All);
                        permissions.AddRange(User.All);

                        break;

                    case "User":
                        permissions.Add(BankAccount.OrderCard);
                        permissions.Add(BankAccount.Withdraw);
                        permissions.Add(BankAccount.ViewOwnTransactions);
                        permissions.Add(Transaction.Create);
                        permissions.Add(Card.Block);

                        break;

                    case "Moderator":
                        permissions.AddRange(BankAccount.All);
                        permissions.AddRange(Transaction.All);
                        permissions.AddRange(Card.All);
                        break;
                }
            }

            return permissions.Distinct().ToList();
        }*/
        public async Task<BaseResponse<string>> RoleUpdateAsync(RoleUpdateDto dto)
        {
            var role = await _roleManager.FindByIdAsync(dto.RoleId);
            if (role == null)
                return new BaseResponse<string>("Role not found", HttpStatusCode.NotFound);

            var existingClaims = await _roleManager.GetClaimsAsync(role);

            foreach (var permission in dto.Permissions)
            {
                if (!existingClaims.Any(c => c.Type == "Permission" && c.Value == permission))
                {
                    await _roleManager.AddClaimAsync(role, new System.Security.Claims.Claim("Permission", permission));
                }
            }

            return new BaseResponse<string>("Permissions added successfully", HttpStatusCode.OK);
        }

      
            public async Task<List<string>> GetPermissionsByRoleAsync(string userId)
            {
                var user = await _userManager.FindByIdAsync(userId);

                if (user == null)
                    return new List<string>();

                var roles = await _userManager.GetRolesAsync(user);

                var permissions = new HashSet<string>();

                foreach (var roleName in roles)
                {
                    var role = await _roleManager.FindByNameAsync(roleName);

                    if (role == null)
                        continue;

                    var claims = await _roleManager.GetClaimsAsync(role);

                    foreach (var claim in claims)
                    {
                        if (claim.Type == "Permission")
                        {
                            permissions.Add(claim.Value);
                        }
                    }
                }

                return permissions.ToList();
            }

      
    }
    }

