using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.UserDtos
{
    public record class UserLoginDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        //public DateTime LastLoginDate { get; set; }
    }
}
