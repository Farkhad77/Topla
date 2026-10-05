using Arenio.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.BookingDtos
{
    public record class BookingOwnerDto
    {
        public Guid BookingId { get; set; }

        public Guid StadiumId { get; set; }

        public string StadiumName { get; set; } = null!;

        public string CustomerId { get; set; } = null!;

        public string CustomerName { get; set; } = null!;

        public DateTime StartDateTime { get; set; }

        public DateTime EndDateTime { get; set; }

        public decimal TotalPrice { get; set; }

        public BookingStatus Status { get; set; }
    }
}
