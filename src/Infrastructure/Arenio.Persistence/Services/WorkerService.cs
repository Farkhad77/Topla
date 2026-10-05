using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.WorkerDtos;
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
    public class WorkerService : IWorkerService
    {
        private readonly ArenioDbContext _context;
        private readonly ICurrentUserService _currentUser;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public WorkerService(
            ArenioDbContext context,
            ICurrentUserService currentUser,
            UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _currentUser = currentUser;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<BaseResponse<string?>> AssignWorkerAsync(AssignWorkerDto dto)
        {
            var ownerUserId = _currentUser.UserId;

            if (string.IsNullOrEmpty(ownerUserId))
                return new BaseResponse<string?>("Unauthorized", HttpStatusCode.Unauthorized);

            if (dto is null || string.IsNullOrWhiteSpace(dto.WorkerEmail))
                return new BaseResponse<string?>("Worker email is required.", HttpStatusCode.BadRequest);

            var ownerProfile = await _context.StadiumOwnerProfiles
                .FirstOrDefaultAsync(x => x.UserId == ownerUserId);

            if (ownerProfile is null)
                return new BaseResponse<string?>("Owner profile not found.", HttpStatusCode.NotFound);

            var worker = await _userManager.FindByEmailAsync(dto.WorkerEmail);

            if (worker is null)
                return new BaseResponse<string?>(
                    "No user found with this email. The worker must register first.",
                    HttpStatusCode.NotFound);

            if (worker.Id == ownerUserId)
                return new BaseResponse<string?>(
                    "You cannot assign yourself as a worker.",
                    HttpStatusCode.BadRequest);

            // Owner rolu olan istifadəçi işçi kimi təyin oluna bilməz (qarışıqlığın qarşısı)
            if (await _userManager.IsInRoleAsync(worker, UserRole.Owner.ToString()))
                return new BaseResponse<string?>(
                    "An owner cannot be assigned as a worker.",
                    HttpStatusCode.BadRequest);

            // Bir işçi yalnız bir şirkətə aid ola bilər
            var activeElsewhere = await _context.BusinessWorkers
                .AnyAsync(x =>
                    x.WorkerUserId == worker.Id &&
                    x.IsActive &&
                    x.OwnerProfileId != ownerProfile.Id);

            if (activeElsewhere)
                return new BaseResponse<string?>(
                    "This user is already an active worker of another business.",
                    HttpStatusCode.BadRequest);

            var existing = await _context.BusinessWorkers
                .FirstOrDefaultAsync(x =>
                    x.OwnerProfileId == ownerProfile.Id &&
                    x.WorkerUserId == worker.Id);

            if (existing is not null && existing.IsActive)
                return new BaseResponse<string?>(
                    "This user is already a worker of your business.",
                    HttpStatusCode.BadRequest);

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                if (existing is not null)
                {
                    // Əvvəl silinmiş təyinatı yenidən aktivləşdir
                    existing.IsActive = true;
                    existing.AssignedByUserId = ownerUserId;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    await _context.BusinessWorkers.AddAsync(new BusinessWorker
                    {
                        Id = Guid.NewGuid(),
                        OwnerProfileId = ownerProfile.Id,
                        WorkerUserId = worker.Id,
                        AssignedByUserId = ownerUserId,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                // Worker rolu mövcud deyilsə yarat
                if (!await _roleManager.RoleExistsAsync(UserRole.Worker.ToString()))
                {
                    await _roleManager.CreateAsync(new IdentityRole(UserRole.Worker.ToString()));
                }

                if (!await _userManager.IsInRoleAsync(worker, UserRole.Worker.ToString()))
                {
                    var roleResult = await _userManager.AddToRoleAsync(worker, UserRole.Worker.ToString());

                    if (!roleResult.Succeeded)
                    {
                        await transaction.RollbackAsync();
                        return new BaseResponse<string?>(
                            string.Join(", ", roleResult.Errors.Select(e => e.Description)),
                            HttpStatusCode.BadRequest);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new BaseResponse<string?>(
                    null,
                    "Worker assigned successfully.",
                    HttpStatusCode.OK);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<BaseResponse<string?>> RemoveWorkerAsync(string workerUserId)
        {
            var ownerUserId = _currentUser.UserId;

            if (string.IsNullOrEmpty(ownerUserId))
                return new BaseResponse<string?>("Unauthorized", HttpStatusCode.Unauthorized);

            if (string.IsNullOrWhiteSpace(workerUserId))
                return new BaseResponse<string?>("Worker id is required.", HttpStatusCode.BadRequest);

            var ownerProfile = await _context.StadiumOwnerProfiles
                .FirstOrDefaultAsync(x => x.UserId == ownerUserId);

            if (ownerProfile is null)
                return new BaseResponse<string?>("Owner profile not found.", HttpStatusCode.NotFound);

            var assignment = await _context.BusinessWorkers
                .FirstOrDefaultAsync(x =>
                    x.OwnerProfileId == ownerProfile.Id &&
                    x.WorkerUserId == workerUserId &&
                    x.IsActive);

            if (assignment is null)
                return new BaseResponse<string?>(
                    "Active worker assignment not found.",
                    HttpStatusCode.NotFound);

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                assignment.IsActive = false;
                assignment.UpdatedAt = DateTime.UtcNow;

                var worker = await _userManager.FindByIdAsync(workerUserId);

                if (worker is not null)
                {
                    // Başqa aktiv təyinatı yoxdursa Worker rolunu geri al
                    var hasOtherActive = await _context.BusinessWorkers
                        .AnyAsync(x =>
                            x.WorkerUserId == workerUserId &&
                            x.IsActive &&
                            x.Id != assignment.Id);

                    if (!hasOtherActive &&
                        await _userManager.IsInRoleAsync(worker, UserRole.Worker.ToString()))
                    {
                        await _userManager.RemoveFromRoleAsync(worker, UserRole.Worker.ToString());
                    }

                    // Security stamp-i yenilə → işçinin köhnə tokeni dərhal etibarsız olur
                    await _userManager.UpdateSecurityStampAsync(worker);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new BaseResponse<string?>(
                    null,
                    "Worker removed successfully.",
                    HttpStatusCode.OK);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<BaseResponse<List<WorkerViewDto>>> GetMyWorkersAsync()
        {
            var ownerUserId = _currentUser.UserId;

            if (string.IsNullOrEmpty(ownerUserId))
                return new BaseResponse<List<WorkerViewDto>>("Unauthorized", HttpStatusCode.Unauthorized);

            var ownerProfile = await _context.StadiumOwnerProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.UserId == ownerUserId);

            if (ownerProfile is null)
                return new BaseResponse<List<WorkerViewDto>>("Owner profile not found.", HttpStatusCode.NotFound);

            var workers = await _context.BusinessWorkers
                .AsNoTracking()
                .Where(x => x.OwnerProfileId == ownerProfile.Id)
                .Include(x => x.WorkerUser)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new WorkerViewDto
                {
                    UserId = x.WorkerUserId,
                    FullName = x.WorkerUser.FullName,
                    Email = x.WorkerUser.Email!,
                    IsActive = x.IsActive,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync();

            return new BaseResponse<List<WorkerViewDto>>(
                workers,
                "Workers retrieved successfully.",
                HttpStatusCode.OK);
        }

        public async Task<BaseResponse<WorkerBusinessDto>> GetMyBusinessAsync()
        {
            var userId = _currentUser.UserId;

            if (string.IsNullOrEmpty(userId))
                return new BaseResponse<WorkerBusinessDto>("Unauthorized", HttpStatusCode.Unauthorized);

            var assignment = await _context.BusinessWorkers
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.WorkerUserId == userId && x.IsActive);

            if (assignment is null)
                return new BaseResponse<WorkerBusinessDto>(
                    "You are not assigned to any business.",
                    HttpStatusCode.NotFound);

            var stadiums = await _context.Stadiums
                .AsNoTracking()
                .Where(x => x.StadiumOwnerProfileId == assignment.OwnerProfileId)
                .Select(x => new WorkerStadiumBriefDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    City = x.City
                })
                .ToListAsync();

            var result = new WorkerBusinessDto
            {
                OwnerProfileId = assignment.OwnerProfileId,
                Stadiums = stadiums
            };

            return new BaseResponse<WorkerBusinessDto>(
                result,
                "Business retrieved successfully.",
                HttpStatusCode.OK);
        }
    }
}
