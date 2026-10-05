using Arenio.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Domain.Entities
{
    public class StadiumOwnerProfile : BaseEntity
    {
        public string Id { get; set; }

        public string UserId { get; set; }

        public User User { get; set; }

        public ICollection<Stadium> OwnedStadiums { get; set; }
            = new List<Stadium>();

        public DateTime CreatedAt { get; set; }
    }
}
