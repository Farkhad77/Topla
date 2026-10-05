using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Arenio.Domain.Enums;

namespace Arenio.Domain.Entities
{
    
 

    

    public class OwnerRequest : BaseEntity
    {
        

        public string UserId { get; set; }

        public User User { get; set; }

        public ApprovalStatus Status { get; set; }

        public string? RejectReason { get; set; }

        public string? Message { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public string? ReviewedById { get; set; }

        public User? ReviewedBy { get; set; }
    }
}
