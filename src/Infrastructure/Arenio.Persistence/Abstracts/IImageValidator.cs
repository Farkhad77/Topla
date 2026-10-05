using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Abstracts
{
    using Microsoft.AspNetCore.Http;

    public interface IImageValidator
    {
        Task ValidateAsync(IFormFile file);
    }
}
