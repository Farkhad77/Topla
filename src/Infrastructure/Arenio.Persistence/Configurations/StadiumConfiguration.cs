using Arenio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Arenio.Persistence.Configurations;

public class StadiumConfiguration : IEntityTypeConfiguration<Stadium>
{
    public void Configure(EntityTypeBuilder<Stadium> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Description)
            .HasMaxLength(1000);

        builder.Property(x => x.City)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Address)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(x => x.Latitude)
            .IsRequired();

        builder.Property(x => x.Longitude)
            .IsRequired();

        builder.Property(x => x.PricePerHour)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(x => x.Size)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.SurfaceType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.OpenTime)
            .IsRequired();

        builder.Property(x => x.CloseTime)
            .IsRequired();

        builder.Property(x => x.MinBookingMinutes)
            .IsRequired();

        builder.Property(x => x.MaxBookingMinutes)
            .IsRequired();

        builder.Property(x => x.IsActive)
            .IsRequired();

        builder.Property(x => x.VerificationStatus)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.RejectReason)
            .HasMaxLength(500);

        builder.Property(x => x.ReviewedAt);

        builder.Property(x => x.ReviewedById);

        builder.Property(x => x.StadiumOwnerProfileId)
            .IsRequired();

        // Stadium Owner -> Stadiums
        builder.HasOne(x => x.StadiumOwnerProfile)
            .WithMany(x => x.OwnedStadiums)
            .HasForeignKey(x => x.StadiumOwnerProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        // Admin (Reviewer) -> Stadiums
        builder.HasOne(x => x.ReviewedBy)
            .WithMany()
            .HasForeignKey(x => x.ReviewedById)
            .OnDelete(DeleteBehavior.SetNull);

        // Stadium -> Bookings
        builder.HasMany(x => x.Bookings)
            .WithOne(x => x.Stadium)
            .HasForeignKey(x => x.StadiumId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Property(s => s.AverageRating)
            .HasColumnType("decimal(3,2)") 
            .HasDefaultValue(0.0);

        builder.Property(s => s.TotalReviews)
            .HasDefaultValue(0);
        builder.HasMany(x => x.BlockedSlots)
    .WithOne(x => x.Stadium)
    .HasForeignKey(x => x.StadiumId)
    .OnDelete(DeleteBehavior.NoAction);

    }
}