using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Configurations
{
    using Arenio.Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;

    public class BusinessWorkerConfiguration : IEntityTypeConfiguration<BusinessWorker>
    {
        public void Configure(EntityTypeBuilder<BusinessWorker> builder)
        {
            builder.ToTable("BusinessWorkers");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.OwnerProfileId)
                .IsRequired();

            builder.Property(x => x.WorkerUserId)
                .IsRequired()
                .HasMaxLength(450);

            builder.Property(x => x.AssignedByUserId)
                .HasMaxLength(450);

            builder.Property(x => x.IsActive)
                .IsRequired();

            builder.HasOne(x => x.OwnerProfile)
                .WithMany()
                .HasForeignKey(x => x.OwnerProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.WorkerUser)
                .WithMany()
                .HasForeignKey(x => x.WorkerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Eyni işçi eyni biznesə iki dəfə təyin olunmasın
            builder.HasIndex(x => new { x.OwnerProfileId, x.WorkerUserId })
                .IsUnique();
        }
    }
}
