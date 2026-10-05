using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.StadiumImagesDtos
{
    public class StadiumImageDto
    {
        public Guid Id { get; set; }

        public string ImageUrl { get; set; } = null!;

        public bool IsMain { get; set; }

        public int Order { get; set; }
    }
}
