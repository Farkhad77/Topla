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

    public class OwnerRequestConfiguration : IEntityTypeConfiguration<OwnerRequest>
    {
        public void Configure(EntityTypeBuilder<OwnerRequest> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.UserId)
                .IsRequired();

            builder.Property(x => x.Status)
                .IsRequired();

            builder.Property(x => x.RejectReason)
                .HasMaxLength(500);

            builder.Property(x => x.Message)
                .HasMaxLength(1000);

            builder.Property(x => x.ReviewedAt);

            builder.Property(x => x.ReviewedById);

            builder.HasOne(x => x.User)
                .WithMany(x => x.OwnerRequests)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.ReviewedBy)
                .WithMany()
                .HasForeignKey(x => x.ReviewedById)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
