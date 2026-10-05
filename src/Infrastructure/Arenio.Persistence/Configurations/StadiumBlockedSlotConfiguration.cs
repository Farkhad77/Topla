using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Configurations
{
    using Arenio.Domain.Entities;
    using global::Arenio.Domain.Entities;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;


    public class StadiumBlockedSlotConfiguration
        : IEntityTypeConfiguration<StadiumBlockedSlot>
    {
        public void Configure(EntityTypeBuilder<StadiumBlockedSlot> builder)
        {
            builder.ToTable("StadiumBlockedSlots");

            // Primary Key
            builder.HasKey(x => x.Id);

            // StadiumId
            builder.Property(x => x.StadiumId)
                .IsRequired();

            // StartTime
            builder.Property(x => x.StartTime)
                .IsRequired();

            // EndTime
            builder.Property(x => x.EndTime)
                .IsRequired();

            // Reason
            builder.Property(x => x.Reason)
                .HasMaxLength(500)
                .IsRequired(false);

            // CreatedByUserId
            builder.Property(x => x.CreatedByUserId)
                .IsRequired()
                .HasMaxLength(450);

            // Stadium relationship
            builder.HasOne(x => x.Stadium)
                .WithMany(x => x.BlockedSlots)
                .HasForeignKey(x => x.StadiumId)
                .OnDelete(DeleteBehavior.NoAction);

            // Index
            builder.HasIndex(x => new
            {
                x.StadiumId,
                x.StartTime,
                x.EndTime
            });
        }
    }
}
