using Arenio.Application.Settings;
using Arenio.Persistence.Abstracts;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Processing;
namespace Arenio.Persistence.Services
{
    public  class FileService:IFileService
    {
        

    private readonly StorageSettings _storageSettings;
    private readonly IImageValidator _validator;
    private readonly Microsoft.Extensions.Hosting.IHostEnvironment _environment;

    public FileService(
        IImageValidator validator,
        IOptions<StorageSettings> storageSettings,
        Microsoft.Extensions.Hosting.IHostEnvironment environment)
    {
        _validator = validator;
        _storageSettings = storageSettings.Value;
        // ContentRootPath istifadə olunur: Directory.GetCurrentDirectory() tətbiqin
        // haradan işə salınmasından asılıdır və UseStaticFiles ilə uyğunsuz düşə bilər.
        _environment = environment;
    }

        public async Task<List<string>> UploadAsync(List<IFormFile> files)
        {
            var result = new List<string>();

            var root = Path.Combine(
                _environment.ContentRootPath,
                _storageSettings.RootPath,
                _storageSettings.StadiumFolder);

            if (!Directory.Exists(root))
                Directory.CreateDirectory(root);

            // Əvvəl BÜTÜN fayllar yoxlanılır — biri keçməsə heç nə diskə yazılmır
            // (yarımçıq batch-dən yetim fayllar qalmasın).
            foreach (var file in files)
            {
                await _validator.ValidateAsync(file);
            }

            foreach (var file in files)
            {
                var fileName = $"{Guid.NewGuid()}.webp";

                var fullPath = Path.Combine(root, fileName);

                await SaveAsWebp(file, fullPath);

                // DB-də saxlanan nisbi yol serve olunan URL ilə eynidir:
                // "Storage/Stadiums/xxx.webp" → GET /Storage/Stadiums/xxx.webp
                result.Add(
                    $"{_storageSettings.RootPath}/{_storageSettings.StadiumFolder}/{fileName}");
            }

            return result;
        }
        private static async Task SaveAsWebp(
    IFormFile file,
    string path)
        {
            using var stream = file.OpenReadStream();

            var options = new DecoderOptions
            {
                MaxFrames = 1
            };

            using var image = await Image.LoadAsync(options, stream);

            image.Metadata.ExifProfile = null;

            image.Mutate(x =>
            {
                x.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(1920, 1920)
                });
            });

            await image.SaveAsync(path, new WebpEncoder
            {
                Quality = 80
            });
        }
        public Task DeleteAsync(string relativePath)
        {
            if (string.IsNullOrWhiteSpace(relativePath))
                return Task.CompletedTask;

            var normalized = relativePath
                .Replace('\\', '/')
                .TrimStart('/');

            // Yeni format: "Storage/Stadiums/x.webp" (RootPath daxildir).
            // Köhnə format: "Stadiums/x.webp" — geriyə uyğunluq üçün RootPath əlavə olunur.
            if (!normalized.StartsWith(
                    $"{_storageSettings.RootPath}/",
                    StringComparison.OrdinalIgnoreCase))
            {
                normalized = $"{_storageSettings.RootPath}/{normalized}";
            }

            var fullPath = Path.Combine(
                _environment.ContentRootPath,
                normalized.Replace('/', Path.DirectorySeparatorChar));

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }

            return Task.CompletedTask;
        }



    }
}
