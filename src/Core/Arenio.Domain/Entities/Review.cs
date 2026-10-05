using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Domain.Entities
{
    public class Review : BaseEntity
    {
        

        
        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;

      
        public Guid StadiumId { get; set; }
        public Stadium? Stadium { get; set; }

        public string UserId { get; set; }
        public User User { get; set; }
      
    }
}
