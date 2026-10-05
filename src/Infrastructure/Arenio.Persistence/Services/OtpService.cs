using Arenio.Application.Abstracts.Services;
using Arenio.Domain.Entities;
using Arenio.Persistence.Contexts;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Services
{
    using System.Net;
    using System.Security.Cryptography;
    using System.Text.Json;
    using Arenio.Application.DTOs.EmailDtos;
    using Arenio.Application.Settings;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;
    using StackExchange.Redis;

    public class OtpService : IOtpService
    {
        private readonly IDatabase _db;
        private readonly ArenioDbContext _context;
        private readonly IEmailService _emailService;
        
        public OtpService(
            IConnectionMultiplexer redis,
            ArenioDbContext context,
            IEmailService emailService
            )
        {
            _db = redis.GetDatabase();
            _context = context;
            _emailService = emailService;
            
        }

        private static string GenerateOtpCode()
        {
            return RandomNumberGenerator
                .GetInt32(100000, 1000000)
                .ToString();
        }

        public async Task GenerateOtpByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email is required.", nameof(email));

            var otp = GenerateOtpCode();

            var otpCache = new EmailOtpCacheDto
            {
                Code = otp,
                Attempts = 0
            };

            await _db.StringSetAsync(
                $"auth:otp:email:{email}",
                JsonSerializer.Serialize(otpCache),
                TimeSpan.FromMinutes(5));

            await _emailService.SendEmailAsync(
                email,
                "Your OTP Code",
                $"Your OTP code is <b>{otp}</b>. It will expire in 5 minutes.");
        }

        public async Task<bool> VerifyOtpByEmailAsync(string email, string otp)
        {
            if (string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(otp))
                return false;

            var key = $"auth:otp:email:{email}";

            var json = await _db.StringGetAsync(key);

            if (json.IsNullOrEmpty)
                return false;

            var otpCache = JsonSerializer.Deserialize<EmailOtpCacheDto>(json!);

            if (otpCache == null)
                return false;

            if (otpCache.Code == otp)
            {
                await _db.KeyDeleteAsync(key);
                return true;
            }

            otpCache.Attempts++;

            if (otpCache.Attempts >= 5)
            {
                await _db.KeyDeleteAsync(key);
                return false;
            }

            await _db.StringSetAsync(
                key,
                JsonSerializer.Serialize(otpCache),
                TimeSpan.FromMinutes(5));

            return false;
        }

        public async Task GenerateOtpByUserIdAsync(string userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
                throw new KeyNotFoundException("User not found.");

            var otp = GenerateOtpCode();

            var otpCache = new EmailOtpCacheDto
            {
                Code = otp,
                Attempts = 0
            };

            await _db.StringSetAsync(
                $"auth:otp:user:{userId}",
                JsonSerializer.Serialize(otpCache),
                TimeSpan.FromMinutes(5));

            await _emailService.SendEmailAsync(
                user.Email!,
                "Your OTP Code",
                $"Your OTP code is <b>{otp}</b>. It will expire in 5 minutes.");
        }

        public async Task<bool> VerifyOtpByUserIdAsync(string userId, string otp)
        {
            var key = $"auth:otp:user:{userId}";

            var json = await _db.StringGetAsync(key);

            if (json.IsNullOrEmpty)
                return false;

            var otpCache = JsonSerializer.Deserialize<EmailOtpCacheDto>(json!);

            if (otpCache == null)
                return false;

            if (otpCache.Code == otp)
            {
                await _db.KeyDeleteAsync(key);
                return true;
            }

            otpCache.Attempts++;

            if (otpCache.Attempts >= 5)
            {
                await _db.KeyDeleteAsync(key);
                return false;
            }

            await _db.StringSetAsync(
                key,
                JsonSerializer.Serialize(otpCache),
                TimeSpan.FromMinutes(5));

            return false;
        }
        public async Task<BaseResponse<string>> ResendOtpAsync(string email)
        {
            email = email.Trim().ToLowerInvariant();

            var redisKey = $"auth:pending-user:{email}";

            // Pending registration mövcuddur?
            var pendingUser = await _db.StringGetAsync(redisKey);

            if (pendingUser.IsNullOrEmpty)
            {
                return new BaseResponse<string>(
                    "Registration session expired or does not exist.",
                    HttpStatusCode.BadRequest);
            }

            // Yeni OTP yarat və göndər
            await GenerateOtpByEmailAsync(email);

            return new BaseResponse<string>(
                "A new OTP has been sent to your email.",
                HttpStatusCode.OK);
        }
    }
}
