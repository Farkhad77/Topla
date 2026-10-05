using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.StadiumImagesDtos
{
    public class StadiumImagesReorderDto
    {
        public Guid StadiumId { get; set; }

        public List<ReorderImageDto> Images { get; set; } = [];
    }
}
