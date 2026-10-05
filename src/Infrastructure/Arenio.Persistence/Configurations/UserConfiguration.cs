using Arenio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Arenio.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasMany(x => x.Bookings)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.FullName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.RefreshToken)
            .HasMaxLength(500);
        builder.Property(x => x.IsBlocked)
           .HasDefaultValue(false);

        builder.Property(x => x.BlockReason)
            .HasMaxLength(500);

        builder.Property(x => x.BlockedAt);

        builder.Property(x => x.BlockedById)
            .HasMaxLength(450);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.BlockedById)
            .OnDelete(DeleteBehavior.NoAction);
    }
}