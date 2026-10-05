using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.RequestDtos;
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
    public class OwnerRequestService : IOwnerRequestService
    {
        private readonly ArenioDbContext _context;
        private readonly ICurrentUserService _currentUser;
        private readonly UserManager<User> _userManager;

        public OwnerRequestService(
            ArenioDbContext context,
            ICurrentUserService currentUser, UserManager<User> userManager
            )
        {
            _context = context;
            _currentUser = currentUser;
            _userManager = userManager;
        }
        public async Task<BaseResponse<string>> CreateRequest(RequestCreateOwnerDto dto)
        {
            var userId = _currentUser.UserId;

            if (string.IsNullOrWhiteSpace(userId))
            {
                return new BaseResponse<string>(
                    "Unauthorized",
                    HttpStatusCode.Unauthorized);
            }

            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return new BaseResponse<string>(
                    "User not found.",
                    HttpStatusCode.NotFound);
            }

            var isOwner = await _userManager.IsInRoleAsync(user, UserRole.Owner.ToString());

            if (isOwner)
            {
                return new BaseResponse<string>(
                    "You are already an owner.",
                    HttpStatusCode.BadRequest);
            }

            var pendingRequest = await _context.OwnerRequests
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.Status == ApprovalStatus.Pending);

            if (pendingRequest != null)
            {
                return new BaseResponse<string>(
                    "You already have a pending request.",
                    HttpStatusCode.BadRequest);
            }

            var approvedRequest = await _context.OwnerRequests
                .AnyAsync(x =>
                    x.UserId == userId &&
                    x.Status == ApprovalStatus.Approved);

            if (approvedRequest)
            {
                return new BaseResponse<string>(
                    "Your owner request has already been approved.",
                    HttpStatusCode.BadRequest);
            }

            var request = new OwnerRequest
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Message = dto.Message,
                Status = ApprovalStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _context.OwnerRequests.AddAsync(request);
            await _context.SaveChangesAsync();

            return new BaseResponse<string>(
                "Your owner request has been sent successfully.",
                HttpStatusCode.OK);
        }
        public async Task<BaseResponse<RequestViewOwnerDto>> GetMyRequest()
        {
            var userId = _currentUser.UserId;

            if (string.IsNullOrWhiteSpace(userId))
            {
                return new BaseResponse<RequestViewOwnerDto>(
                "Unauthorized",
                    HttpStatusCode.Unauthorized);
            }

            var request = await _context.OwnerRequests
                .Include(x => x.User)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync(x => x.UserId == userId);

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
                Email = request.User.Email,
                Status = request.Status,
                Message = request.Message,
                RejectReason = request.RejectReason,
                CreatedAt = request.CreatedAt
            };

            return new BaseResponse<RequestViewOwnerDto>(
                dto, "Request retrieved successfully.; ",
                HttpStatusCode.OK);
        }

    }
}
