using Arenio.Application.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Services
{
    public interface IOtpService
    {

        Task GenerateOtpByEmailAsync(string email);
        Task<bool> VerifyOtpByEmailAsync(string email, string otp);
        Task<BaseResponse<string>> ResendOtpAsync(string email);
        Task GenerateOtpByUserIdAsync(string userId);
        Task<bool> VerifyOtpByUserIdAsync(string userId, string otp);
    }
}
