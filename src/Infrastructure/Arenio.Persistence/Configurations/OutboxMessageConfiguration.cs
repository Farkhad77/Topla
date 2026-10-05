using Arenio.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Configurations
{
    public class OutboxMessageConfiguration
      : IEntityTypeConfiguration<OutboxMessage>
    {
        public void Configure(EntityTypeBuilder<OutboxMessage> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Type)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Payload)
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.Property(x => x.Processed)
                .IsRequired();
        }
    }
}
