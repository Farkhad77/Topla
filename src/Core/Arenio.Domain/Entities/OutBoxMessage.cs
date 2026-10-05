using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Domain.Entities
{
    public class OutboxMessage:BaseEntity
    {
        

        public string Type { get; set; } = null!;

        public string Payload { get; set; } = null!;

        public int RetryCount { get; set; }

        public bool Processed { get; set; }

        public DateTime? ProcessedAt { get; set; }
    }
}
