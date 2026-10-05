using Arenio.Application.DTOs.UserDtos;
using Arenio.Application.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Services
{
    public interface IUserService
    {
        Task<BaseResponse<string>> RegisterAsync(UserRegisterDto dto);
        Task<BaseResponse<TokenResponse>> Login(UserLoginDto dto);
        Task<BaseResponse<TokenResponse>> RefreshTokenAsync(RefreshTokenRequest request);
        Task<BaseResponse<PagedResult<UserDto>>> GetAllAsync(int pageNumber = 1, int pageSize = 10);
        Task<BaseResponse<UserDto>> GetByIdAsync(string id);
        Task<BaseResponse<string>> DeleteAsync(string id);
        Task<BaseResponse<string?>> ForgotPasswordAsync(ForgotPasswordDto dto);

        Task<BaseResponse<string?>> ResetPasswordAsync(ResetPasswordDto dto);
        Task<BaseResponse<TokenResponse>> ConfirmRegisterOtpAsync(
        UserConfirmRegisterOtpDto dto);
    }
}
