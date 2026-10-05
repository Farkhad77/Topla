using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Domain.Models
{
    public class StadiumDocument
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string City { get; set; } = default!;
        public decimal PricePerHour { get; set; }
        public string Description { get; set; } = default!;
    }
}
