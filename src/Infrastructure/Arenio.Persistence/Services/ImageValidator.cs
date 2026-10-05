using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Services
{
    using Arenio.Persistence.Abstracts;
    using FluentValidation;
    using Microsoft.AspNetCore.Http;
    using SixLabors.ImageSharp;
    using SixLabors.ImageSharp.Formats;

    public class ImageValidator : IImageValidator
    {
        private const long MaxFileSize = 5 * 1024 * 1024;
        private const int MinWidth = 300;
        private const int MinHeight = 300;

        private const int MaxWidth = 6000;
        private const int MaxHeight = 6000;
        private const long MaxPixels = 36_000_000;

        private static readonly string[] AllowedExtensions =
        {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    };

        private static readonly string[] AllowedContentTypes =
        {
        "image/jpeg",
        "image/png",
        "image/webp"
    };

        public async Task ValidateAsync(IFormFile file)
        {
            if (file is null)
                throw new ValidationException("File not found.");

            ValidateLength(file);
            ValidateExtension(file);
            ValidateContentType(file);

            using var stream = file.OpenReadStream();

            await ValidateSignature(stream);

            stream.Position = 0;

            await ValidateDimensions(stream);
        }


        private static async Task ValidateDimensions(Stream stream)
        {
            var options = new DecoderOptions
            {
                MaxFrames = 1
            };

            using var image = await Image.LoadAsync(options, stream);

            if (image.Width < MinWidth)
                throw new ValidationException($"Minimum width is {MinWidth}px.");

            if (image.Height < MinHeight)
                throw new ValidationException($"Minimum height is {MinHeight}px.");

            if (image.Width > MaxWidth)
                throw new ValidationException($"Maximum width is {MaxWidth}px.");

            if (image.Height > MaxHeight)
                throw new ValidationException($"Maximum height is {MaxHeight}px.");

            long pixels = (long)image.Width * image.Height;

            if (pixels > MaxPixels)
                throw new ValidationException("Image resolution is too large.");
        }
        private static void ValidateLength(IFormFile file)
        {
            if (file.Length == 0)
                throw new ValidationException("Empty file.");

            if (file.Length > MaxFileSize)
                throw new ValidationException("Maximum size is 5 MB.");
        }

        private static void ValidateExtension(IFormFile file)
        {
            var extension =
                Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!AllowedExtensions.Contains(extension))
                throw new ValidationException("Invalid extension.");
        }

        private static void ValidateContentType(IFormFile file)
        {
            if (!AllowedContentTypes.Contains(file.ContentType))
                throw new ValidationException("Invalid content type.");
        }

        private static async Task ValidateSignature(Stream stream)
        {
            var header = new byte[12];

            await stream.ReadAsync(header);

            if (IsJpeg(header))
                return;

            if (IsPng(header))
                return;

            if (IsWebP(header))
                return;

            throw new ValidationException("Invalid image.");
        }

        private static bool IsJpeg(byte[] b)
        {
            return b[0] == 0xFF &&
                   b[1] == 0xD8 &&
                   b[2] == 0xFF;
        }

        private static bool IsPng(byte[] b)
        {
            return b[0] == 0x89 &&
                   b[1] == 0x50 &&
                   b[2] == 0x4E &&
                   b[3] == 0x47;
        }

        private static bool IsWebP(byte[] b)
        {
            return b[0] == 'R' &&
                   b[1] == 'I' &&
                   b[2] == 'F' &&
                   b[3] == 'F' &&
                   b[8] == 'W' &&
                   b[9] == 'E' &&
                   b[10] == 'B' &&
                   b[11] == 'P';
        }
    }
}
