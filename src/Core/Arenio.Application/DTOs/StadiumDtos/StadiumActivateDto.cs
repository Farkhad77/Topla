using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.StadiumDtos
{
    public record class StadiumActivateDto
    {
        public Guid StadiumId { get; set; }
    }
}
