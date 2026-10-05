using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Services
{
    /// <summary>
    /// Owner + Worker üçün mərkəzi giriş yoxlaması.
    /// </summary>
    public interface IBusinessAccessService
    {
        // Cari istifadəçi bu stadionu idarə edə bilərmi (owner VƏ YA aktiv işçi)?
        Task<bool> CanManageStadiumAsync(Guid stadiumId);

        // Cari istifadəçi hansı owner profili altında işləyir (owner → öz profili; worker → aid olduğu profil)?
        // Tapılmasa null.
        Task<string?> ResolveOwnerProfileIdAsync();
    }
}
