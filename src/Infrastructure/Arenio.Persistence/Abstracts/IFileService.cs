using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Abstracts
{
    using Microsoft.AspNetCore.Http;

    public interface IFileService
    {
        Task<List<string>> UploadAsync(List<IFormFile> files);

        Task DeleteAsync(string path);
    }
}
