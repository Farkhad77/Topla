using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Domain.Entities
{
    /// <summary>
    /// Bir sahibkarın (StadiumOwnerProfile) biznesinə təyin olunmuş işçi.
    /// İşçi biznes səviyyəlidir: owner-un bütün stadionlarını idarə edir.
    /// </summary>
    public class BusinessWorker : BaseEntity
    {
        // Hansı biznesə (owner profilinə) aiddir
        public string OwnerProfileId { get; set; } = null!;
        public StadiumOwnerProfile OwnerProfile { get; set; } = null!;

        // İşçinin User hesabı
        public string WorkerUserId { get; set; } = null!;
        public User WorkerUser { get; set; } = null!;

        // Kim təyin edib (audit)
        public string? AssignedByUserId { get; set; }

        // Soft-delete: təyinat ləğv olunanda false olur (tarixçə qalır)
        public bool IsActive { get; set; } = true;
    }
}
