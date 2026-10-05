using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.BookingDtos
{
    public record class BookingRejectDto
    {
        public string RejectReason { get; set; }
    }
}
