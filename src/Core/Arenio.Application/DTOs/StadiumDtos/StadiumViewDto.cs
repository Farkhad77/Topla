using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.StadiumDtos
{
    public record class ViewStadiumDto
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        public string City { get; set; }

        public string Address { get; set; }

        public decimal PricePerHour { get; set; }

        public string Size { get; set; }

  

      
    }
}
