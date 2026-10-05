using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.UserDtos
{
    public class UserConfirmRegisterOtpDto
    {
        public string Email { get; set; } = null!;

        public string Otp { get; set; } = null!;
    }
}
