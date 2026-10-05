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

    public class StadiumOwnerProfileConfiguration : IEntityTypeConfiguration<StadiumOwnerProfile>
    {
        public void Configure(EntityTypeBuilder<StadiumOwnerProfile> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .ValueGeneratedNever();

            builder.Property(x => x.UserId)
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.HasIndex(x => x.UserId)
                .IsUnique();

            builder.HasOne(x => x.User)
                .WithOne(x => x.StadiumOwnerProfile)
                .HasForeignKey<StadiumOwnerProfile>(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(x => x.OwnedStadiums)
                .WithOne(x => x.StadiumOwnerProfile)
                .HasForeignKey(x => x.StadiumOwnerProfileId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
