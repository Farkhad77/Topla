using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.ReviewDtos
{
    public record ReviewCreateDto
    {

        public Guid StadiumId { get; set; }

        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;
    }

   
}
