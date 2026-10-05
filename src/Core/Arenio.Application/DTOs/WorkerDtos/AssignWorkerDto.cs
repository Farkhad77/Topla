using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.WorkerDtos
{
    public record class AssignWorkerDto
    {
        // Təyin ediləcək işçinin (artıq qeydiyyatdan keçmiş) email-i
        public string WorkerEmail { get; set; } = default!;
    }
}
