using Arenio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Arenio.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Amount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.PaymentMethod).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);
        builder.Property(x => x.TransactionId).HasMaxLength(100);

        builder.HasOne(x => x.Booking)
            .WithOne(x => x.Payment)
            .HasForeignKey<Payment>(x => x.BookingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
