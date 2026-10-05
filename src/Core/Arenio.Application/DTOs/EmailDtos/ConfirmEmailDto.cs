using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.EmailDtos
{
    public record class ConfirmEmailDto
    {
        public string Email { get; set; }
        public string OtpCode { get; set; }
    }
}
