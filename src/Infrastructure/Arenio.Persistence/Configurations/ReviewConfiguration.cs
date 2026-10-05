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

    public class ReviewConfiguration : IEntityTypeConfiguration<Review>
    {
        public void Configure(EntityTypeBuilder<Review> builder)
        {
            builder.HasKey(r => r.Id);

            // Rating məcburi olmalıdır
            builder.Property(r => r.Rating)
                .IsRequired();

            // Şərh mətni üçün maksimum uzunluq təyin edirik (məsələn: 500 simvol)
            builder.Property(r => r.Comment)
                .HasMaxLength(500)
                .IsRequired(false); // Şərh yazmaq məcburi deyilse false edə bilərsən

            // UserId məcburi olmalıdır
            builder.Property(r => r.UserId)
                .IsRequired();

            // --- Əlaqələr (Relationships) ---

            // Review -> Stadium (Çoxun-birlikdə əlaqə - Many-to-One)
            builder.HasOne(r => r.Stadium)
                .WithMany(s => s.Reviews)
                .HasForeignKey(r => r.StadiumId)
                .OnDelete(DeleteBehavior.Cascade); // Stadion silinərsə, rəyləri də silinsin

            // Review -> User
            builder.HasOne(r => r.User)
                .WithMany() // Əgər User-də ICollection<Review> yoxdursa boş saxlayırıq
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade); // İstifadəçi silinərsə rəyləri də silinsin
        }
    }
}
