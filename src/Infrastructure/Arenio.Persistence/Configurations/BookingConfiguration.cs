using Arenio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Arenio.Persistence.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId).IsRequired();
       
        builder.Property(x => x.StartDateTime).IsRequired();
        builder.Property(x => x.EndDateTime).IsRequired();
        builder.Property(x => x.TotalPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);
        builder.Property(x => x.RejectReason)
       .HasMaxLength(500);

        builder.HasOne(x => x.User)
            .WithMany(x => x.Bookings)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Stadium)
            .WithMany(x => x.Bookings)
            .HasForeignKey(x => x.StadiumId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
