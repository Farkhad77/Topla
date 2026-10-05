using Arenio.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.RequestDtos
{
    public record class RequestViewOwnerDto
    {
        public Guid Id { get; set; }

        public string UserId { get; set; }

        public string FullName { get; set; }

        public string Email { get; set; }
        public string? Message { get; set; }     

        public ApprovalStatus Status { get; set; }

        public DateTime CreatedAt { get; set; }

        public string? RejectReason { get; set; }
    }
}
