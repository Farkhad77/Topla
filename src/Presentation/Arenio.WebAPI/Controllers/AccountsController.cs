using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.EmailDtos;
using Arenio.Application.DTOs.UserDtos;
using Arenio.Application.Settings;
using Arenio.Domain.Entities;
using Arenio.Persistence.Contexts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Caching.Distributed;
using StackExchange.Redis;
using System.Net;
using System.Text.Json;
using PendingUserDto = Arenio.Application.DTOs.UserDtos.PendingUserDto;

namespace Arenio.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private IUserService _userService { get; }
        private readonly IDistributedCache _cache;
        private UserManager<Domain.Entities.User> _userManager;
        private readonly IEmailService _emailService;
        private readonly IOtpService _otpService;
        private readonly IDatabase _db;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ArenioDbContext _context;

        public AccountsController(IUserService userService, IDistributedCache cache, UserManager<User> userManager,
            IEmailService emailService,ArenioDbContext context, IOtpService otpService, IConnectionMultiplexer redis, RoleManager<IdentityRole> roleManager)
        {
            _userService = userService;
            _cache = cache;
            _userManager = userManager;
            _emailService = emailService;
            _otpService = otpService;
            _db = redis.GetDatabase();
            _roleManager = roleManager;
            _context = context;


        }
        [HttpPost("create")]
        [ProducesResponseType(typeof(BaseResponse<string>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(BaseResponse<string>), (int)HttpStatusCode.NotFound)]
        [ProducesResponseType(typeof(BaseResponse<string>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto dto)
        {
            var result = await _userService.RegisterAsync(dto);
            return StatusCode((int)result.StatusCode, result);
        }
        [HttpPost("login")]
        [ProducesResponseType(typeof(BaseResponse<TokenResponse>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(BaseResponse<string>), (int)HttpStatusCode.NotFound)]
        [ProducesResponseType(typeof(BaseResponse<string>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {
            var result = await _userService.Login(dto);
            return StatusCode((int)result.StatusCode, result);
        }

        /// <summary>
        /// Access token-in vaxtı bitəndən SONRA çağırılır — ona görə [Authorize] YOXDUR.
        /// Əgər burada [Authorize] olsa, vaxtı keçmiş token JWT middleware-də rədd edilir
        /// və refresh heç vaxt işləmir (sessiya 60 dəqiqədən sonra sərt ölür).
        /// Təhlükəsizlik: token imzası + refresh token DB-də ayrıca yoxlanılır
        /// (UserService.RefreshTokenAsync → GetPrincipalFromExpiredToken).
        /// </summary>
        [HttpPost("refresh token")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(BaseResponse<string>), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(BaseResponse<string>), (int)HttpStatusCode.NotFound)]
        [ProducesResponseType(typeof(BaseResponse<string>), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType(typeof(BaseResponse<string>), (int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest dto)
        {
            var result = await _userService.RefreshTokenAsync(dto);
            return StatusCode((int)result.StatusCode, result);
        }

        [HttpPost("register/confirm-otp")]
        public async Task<IActionResult> ConfirmRegisterOtp(
      UserConfirmRegisterOtpDto dto)
        {
            var response = await _userService.ConfirmRegisterOtpAsync(dto);

            return StatusCode(
                (int)response.StatusCode,
                response);
        }


        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout(
     [FromServices] IDistributedCache cache,
     [FromServices] UserManager<User> userManager)
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (string.IsNullOrEmpty(token))
                return BadRequest("Token not found");

            // Access Token-i blacklist-ə əlavə et
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(60) // Access token müddəti qədər
            };
            // Middleware "blacklist_{token}" açarını yoxlayır – eyni prefiks olmalıdır
            await cache.SetStringAsync($"blacklist_{token}", "true", options);

            // User-i tap (id NameIdentifier claim-indədir)
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                var user = await userManager.FindByIdAsync(userId);
                if (user != null && !string.IsNullOrEmpty(user.RefreshToken))
                {
                    // Refresh token-i də blacklist-ə at
                    var refreshOptions = new DistributedCacheEntryOptions
                    {
                        AbsoluteExpiration = user.RefreshTokenExpiryDate // refresh token expiry ilə uyğun
                    };

                    await cache.SetStringAsync($"blacklist_refresh_{user.RefreshToken}", "true", refreshOptions);

                    // DB-də refresh tokeni silmək də yaxşı təcrübədir
                    user.RefreshToken = null;
                    user.RefreshTokenExpiryDate = null;
                    await userManager.UpdateAsync(user);
                }
            }

            return Ok(new { message = "Logged out successfully" });
        }
        [HttpPost("forgot-password")]
        [EnableRateLimiting("ForgotPasswordPolicy")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
        {
            var response = await _userService.ForgotPasswordAsync(dto);

            return StatusCode((int)response.StatusCode, response);
        }

        [HttpPost("reset-password")]
        [EnableRateLimiting("ResetPasswordPolicy")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
        {
            var response = await _userService.ResetPasswordAsync(dto);

            return StatusCode((int)response.StatusCode, response);
        }
        [HttpPost("resend-otp")]
        [EnableRateLimiting("ResendOtpPolicy")]
        public async Task<IActionResult> ResendOtp([FromBody] ResendOtpDto dto)
        {
            var response = await _otpService.ResendOtpAsync(dto.Email);

            return StatusCode((int)response.StatusCode, response);
        }

    }
}
