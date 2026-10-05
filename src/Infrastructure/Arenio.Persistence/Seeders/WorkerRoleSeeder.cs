using Arenio.Application.Settings;
using Arenio.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Seeders
{
    /// <summary>
    /// "Worker" sistem rolunu və onun sabit permission-larını təmin edir.
    /// İşçilər bu permission-ları JWT-də alır (GenerateTokensAsync rol claim-lərini əlavə edir),
    /// beləliklə policy əsaslı endpoint-lər (Stadium.Create, Booking.Reject və s.) işçilərə də açılır.
    /// Delete/Verify kimi kritik permission-lar VERİLMİR → işçilər onları edə bilmir.
    /// </summary>
    public static class WorkerRoleSeeder
    {
        private static readonly string[] WorkerPermissions = new[]
        {
            Permissions.Stadium.Create,
            Permissions.Stadium.Update,
            Permissions.Stadium.Activate,
            Permissions.Stadium.DeActivate,
            Permissions.Stadium.GetById,
            Permissions.Booking.Reject
        };

        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();

            var roleManager = scope.ServiceProvider
                .GetRequiredService<RoleManager<IdentityRole>>();

            var roleName = UserRole.Worker.ToString();

            var role = await roleManager.FindByNameAsync(roleName);

            if (role is null)
            {
                role = new IdentityRole(roleName);
                await roleManager.CreateAsync(role);
            }

            var existingClaims = await roleManager.GetClaimsAsync(role);

            foreach (var permission in WorkerPermissions)
            {
                var alreadyHas = existingClaims
                    .Any(c => c.Type == "Permission" && c.Value == permission);

                if (!alreadyHas)
                {
                    await roleManager.AddClaimAsync(role, new Claim("Permission", permission));
                }
            }
        }
    }
}
