using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.RequestDtos;
using Arenio.Application.DTOs.UserDtos;
using Arenio.Application.Settings;
using Arenio.Domain.Entities;
using Arenio.Domain.Enums;
using Arenio.Persistence.Contexts;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Services
{
    public class ModeratorService : IModeratorService
    {
        private readonly ArenioDbContext _context;
        private readonly ICurrentUserService _currentUser;
        private readonly UserManager<User> _userManager;
        public ModeratorService(ArenioDbContext context, ICurrentUserService
            currentuser, UserManager<User> usermanager)
        {
            _context = context;
            _currentUser = currentuser;
            _userManager = usermanager;

        }
        public async Task<BaseResponse<string>> ApproveOwnerRequest(Guid requestId)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var request = await _context.OwnerRequests
                .FirstOrDefaultAsync(x => x.Id == requestId);

            if (request == null)
                return new BaseResponse<string>(
                    "Request not found.",
                    HttpStatusCode.NotFound);

            if (request.Status != ApprovalStatus.Pending)
                return new BaseResponse<string>(
                    "This request has already been reviewed.",
                    HttpStatusCode.BadRequest);

            var user = await _userManager.FindByIdAsync(request.UserId);

            if (user == null)
                return new BaseResponse<string>(
                    "User not found.",
                    HttpStatusCode.NotFound);

            if (await _userManager.IsInRoleAsync(user, UserRole.User.ToString()))
            {
                var removeResult = await _userManager.RemoveFromRoleAsync(
                    user,
                    UserRole.User.ToString());

                if (!removeResult.Succeeded)
                {
                    await transaction.RollbackAsync();

                    return new BaseResponse<string>(
                        string.Join(", ", removeResult.Errors.Select(x => x.Description)),
                        HttpStatusCode.BadRequest);
                }
            }

            if (!await _userManager.IsInRoleAsync(user, UserRole.Owner.ToString()))
            {
                var addResult = await _userManager.AddToRoleAsync(
                    user,
                    UserRole.Owner.ToString());

                if (!addResult.Succeeded)
                {
                    await transaction.RollbackAsync();

                    return new BaseResponse<string>(
                        string.Join(", ", addResult.Errors.Select(x => x.Description)),
                        HttpStatusCode.BadRequest);
                }
            }

            var ownerProfileExists = await _context.StadiumOwnerProfiles
                .AnyAsync(x => x.UserId == user.Id);

            if (!ownerProfileExists)
            {
                await _context.StadiumOwnerProfiles.AddAsync(new StadiumOwnerProfile
                {
                    Id = Guid.NewGuid().ToString(),
                    UserId = user.Id,
                    CreatedAt = DateTime.UtcNow
                });
            }

            request.Status = ApprovalStatus.Approved;
            request.ReviewedAt = DateTime.UtcNow;
            request.ReviewedById = _currentUser.UserId;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new BaseResponse<string>(
                "Owner request approved successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<RequestViewOwnerDto>> GetOwnerRequestById(Guid requestId)
        {
            var request = await _context.OwnerRequests
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == requestId);

            if (request == null)
            {
                return new BaseResponse<RequestViewOwnerDto>(
                    "Request not found.",
                    HttpStatusCode.NotFound);
            }

            var dto = new RequestViewOwnerDto
            {
                Id = request.Id,
                UserId = request.UserId,
                FullName = request.User.FullName,
                Email = request.User.Email!,
                Message = request.Message,
                Status = request.Status,
                RejectReason = request.RejectReason,
                CreatedAt = request.CreatedAt
            };

            return new BaseResponse<RequestViewOwnerDto>(
                dto, "Data retrieved successfully.", 
                HttpStatusCode.OK);
        }

        public async Task<BaseResponse<PagedResult<RequestViewOwnerDto>>> GetPendingOwnerRequests(int pageNumber, int pageSize)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var query = _context.OwnerRequests
                .Include(x => x.User)
                .Where(x => x.Status == ApprovalStatus.Pending)
                .OrderByDescending(x => x.CreatedAt);

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new RequestViewOwnerDto
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    FullName = x.User.FullName,
                    Email = x.User.Email!,
                    Message = x.Message,
                    Status = x.Status,
                    RejectReason = x.RejectReason,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync();

            var result = new PagedResult<RequestViewOwnerDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            return new BaseResponse<PagedResult<RequestViewOwnerDto>>(
                result, "Pending owner requests retrieved successfully.",
                HttpStatusCode.OK);
        }

        public async Task<BaseResponse<string>> RejectOwnerRequest(Guid requestId, RequestRejectDto dto)
        {
            var request = await _context.OwnerRequests
                .FirstOrDefaultAsync(x => x.Id == requestId);

            if (request == null)
            {
                return new BaseResponse<string>(
                    "Request not found.",
                    HttpStatusCode.NotFound);
            }

            if (request.Status != ApprovalStatus.Pending)
            {
                return new BaseResponse<string>(
                    "This request has already been reviewed.",
                    HttpStatusCode.BadRequest);
            }

            request.Status = ApprovalStatus.Rejected;
            request.RejectReason = dto.Reason;
            request.ReviewedAt = DateTime.UtcNow;
            request.ReviewedById = _currentUser.UserId;

            await _context.SaveChangesAsync();

            return new BaseResponse<string>(
                "Owner request rejected successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<string?>> BlockUserAsync(
            string userId,
            UserBlockDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
            {
                return new BaseResponse<string?>(
                    "User not found.",
                    HttpStatusCode.NotFound);
            }

            // Moderator öz hesabını bloklaya bilməz
            if (user.Id == _currentUser.UserId)
            {
                return new BaseResponse<string?>(
                    "You cannot block your own account.",
                    HttpStatusCode.BadRequest);
            }

            if (user.IsBlocked)
            {
                return new BaseResponse<string?>(
                    "User is already blocked.",
                    HttpStatusCode.BadRequest);
            }

            user.IsBlocked = true;
            user.BlockReason = dto.Reason;
            user.BlockedAt = DateTime.UtcNow;
            user.BlockedById = _currentUser.UserId;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return new BaseResponse<string?>(
                    "Failed to block user.",
                    HttpStatusCode.BadRequest);
            }

            return new BaseResponse<string?>(
                "User blocked successfully.",
                HttpStatusCode.OK);
        }

        public async Task<BaseResponse<string?>> AssignModeratorRoleAsync(AssignModeratorDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return new BaseResponse<string?>(
                    "Email is required.",
                    HttpStatusCode.BadRequest);
            }

            var user = await _userManager.FindByEmailAsync(dto.Email.Trim());

            if (user is null)
            {
                return new BaseResponse<string?>(
                    "User not found.",
                    HttpStatusCode.NotFound);
            }

            if (await _userManager.IsInRoleAsync(user, UserRole.Admin.ToString()))
            {
                return new BaseResponse<string?>(
                    "This user is an admin — role cannot be changed.",
                    HttpStatusCode.BadRequest);
            }

            if (await _userManager.IsInRoleAsync(user, UserRole.Moderator.ToString()))
            {
                return new BaseResponse<string?>(
                    "User is already a moderator.",
                    HttpStatusCode.BadRequest);
            }

            // ApproveOwnerRequest ilə eyni konvensiya: baza "User" rolu çıxarılır,
            // yeni rol əlavə olunur.
            if (await _userManager.IsInRoleAsync(user, UserRole.User.ToString()))
            {
                var removeResult = await _userManager.RemoveFromRoleAsync(
                    user,
                    UserRole.User.ToString());

                if (!removeResult.Succeeded)
                {
                    return new BaseResponse<string?>(
                        "Failed to update user roles.",
                        HttpStatusCode.BadRequest);
                }
            }

            var addResult = await _userManager.AddToRoleAsync(
                user,
                UserRole.Moderator.ToString());

            if (!addResult.Succeeded)
            {
                var errors = string.Join(
                    " | ",
                    addResult.Errors.Select(e => e.Description));

                return new BaseResponse<string?>(
                    errors,
                    HttpStatusCode.BadRequest);
            }

            // Qeyd: rollar JWT-də saxlanıldığı üçün dəyişiklik istifadəçinin
            // NÖVBƏTİ girişindən (yeni tokendən) sonra qüvvəyə minir.
            return new BaseResponse<string?>(
                "Moderator role assigned successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<string?>> UnblockUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
            {
                return new BaseResponse<string?>(
                    "User not found.",
                    HttpStatusCode.NotFound);
            }
            if (user.Id == _currentUser.UserId)
            {
                return new BaseResponse<string?>(
                    "You cannot unblock your own account.",
                    HttpStatusCode.BadRequest);
            }

            if (!user.IsBlocked)
            {
                return new BaseResponse<string?>(
                    "User is not blocked.",
                    HttpStatusCode.BadRequest);
            }

            user.IsBlocked = false;
            user.BlockReason = null;
            user.BlockedAt = null;
            user.BlockedById = null;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return new BaseResponse<string?>(
                    "Failed to unblock user.",
                    HttpStatusCode.BadRequest);
            }

            return new BaseResponse<string?>(
                "User unblocked successfully.",
                HttpStatusCode.OK);
        }
    }
}
