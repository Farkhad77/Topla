using Arenio.Application.Abstracts.Services;
using Arenio.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Services
{
    public class BusinessAccessService : IBusinessAccessService
    {
        private readonly ArenioDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public BusinessAccessService(
            ArenioDbContext context,
            ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        public async Task<bool> CanManageStadiumAsync(Guid stadiumId)
        {
            var userId = _currentUser.UserId;

            if (string.IsNullOrEmpty(userId))
                return false;

            var stadium = await _context.Stadiums
                .AsNoTracking()
                .Include(x => x.StadiumOwnerProfile)
                .FirstOrDefaultAsync(x => x.Id == stadiumId);

            if (stadium is null)
                return false;

            // Owner-dirsə
            if (stadium.StadiumOwnerProfile.UserId == userId)
                return true;

            // Həmin biznesin aktiv işçisidirsə
            return await _context.BusinessWorkers
                .AsNoTracking()
                .AnyAsync(x =>
                    x.OwnerProfileId == stadium.StadiumOwnerProfileId &&
                    x.WorkerUserId == userId &&
                    x.IsActive);
        }

        public async Task<string?> ResolveOwnerProfileIdAsync()
        {
            var userId = _currentUser.UserId;

            if (string.IsNullOrEmpty(userId))
                return null;

            // Owner-in öz profili
            var ownProfileId = await _context.StadiumOwnerProfiles
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .Select(x => x.Id)
                .FirstOrDefaultAsync();

            if (!string.IsNullOrEmpty(ownProfileId))
                return ownProfileId;

            // İşçi kimi aid olduğu biznes
            var workerProfileId = await _context.BusinessWorkers
                .AsNoTracking()
                .Where(x => x.WorkerUserId == userId && x.IsActive)
                .Select(x => x.OwnerProfileId)
                .FirstOrDefaultAsync();

            return workerProfileId;
        }
    }
}
