using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.ReviewDtos
{
    public record ReviewDto(Guid Id, int Rating, string Comment, DateTime CreatedAt, string UserId, string FullName);
}
