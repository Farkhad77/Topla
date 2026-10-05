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

    public class StadiumImageConfiguration
        : IEntityTypeConfiguration<StadiumImage>
    {
        public void Configure(EntityTypeBuilder<StadiumImage> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.ImageUrl)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(x => x.IsMain)
                .HasDefaultValue(false);

            builder.Property(x => x.Order)
                .HasDefaultValue(0);

            builder.HasOne(x => x.Stadium)
                .WithMany(x => x.Images)
                .HasForeignKey(x => x.StadiumId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
