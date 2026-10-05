using Arenio.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.BookingDtos
{
    public record class BookingDto
    {
        public Guid Id { get; set; }

        public Guid StadiumId { get; set; }

        public string StadiumName { get; set; }

        public string UserId { get; set; }

        public DateTime StartDateTime { get; set; }

        public DateTime EndDateTime { get; set; }

        public decimal TotalPrice { get; set; }

        public BookingStatus Status { get; set; }
    }
}
