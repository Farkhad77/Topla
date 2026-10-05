using Arenio.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.StadiumDtos
{
    public record class StadiumVerifyDto
    {
        public Guid StadiumId { get; set; }

        public StadiumVerificationStatus VerificationStatus { get; set; }
    }
}
