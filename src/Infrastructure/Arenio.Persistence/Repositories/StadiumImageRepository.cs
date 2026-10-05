using Arenio.Application.Abstracts.Repositories;
using Arenio.Domain.Entities;
using Arenio.Persistence.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Repositories
{
    public class StadiumImageRepository
    : Repository<StadiumImage>,
      IStadiumImageRepository
    {
        public StadiumImageRepository(ArenioDbContext context)
            : base(context)
        {
        }
    }
}
