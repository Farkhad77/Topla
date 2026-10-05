using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.EmailDtos
{
    public record class EmailOtpCacheDto
    {
        public string Code { get; set; } = default!;
        public int Attempts { get; set; }
    }
}
