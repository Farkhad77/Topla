using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Settings
{
    public class TokenResponse
    {
        public string? Token { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? ExpireDate { get; set; }
    }
}
