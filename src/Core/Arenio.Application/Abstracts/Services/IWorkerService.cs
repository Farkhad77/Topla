using Arenio.Application.DTOs.WorkerDtos;
using Arenio.Application.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Services
{
    public interface IWorkerService
    {
        // Owner: işçini biznesə təyin edir
        Task<BaseResponse<string?>> AssignWorkerAsync(AssignWorkerDto dto);

        // Owner: işçi təyinatını ləğv edir (soft)
        Task<BaseResponse<string?>> RemoveWorkerAsync(string workerUserId);

        // Owner: biznesimin işçiləri
        Task<BaseResponse<List<WorkerViewDto>>> GetMyWorkersAsync();

        // Worker: aid olduğum biznes və stadionlar
        Task<BaseResponse<WorkerBusinessDto>> GetMyBusinessAsync();
    }
}
