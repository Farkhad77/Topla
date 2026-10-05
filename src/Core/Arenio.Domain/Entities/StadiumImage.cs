using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Domain.Entities
{
    public class StadiumImage : BaseEntity
    {
        public Guid StadiumId { get; set; }

        public string ImageUrl { get; set; } = null!;

        public bool IsMain { get; set; } = false;

        public int Order { get; set; }

        public Stadium Stadium { get; set; } = null!;
    }
}
