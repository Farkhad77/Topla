using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.StadiumImagesDtos
{
    public class ReorderImageDto
    {
        public Guid ImageId { get; set; }

        public int Order { get; set; }
    }
}
