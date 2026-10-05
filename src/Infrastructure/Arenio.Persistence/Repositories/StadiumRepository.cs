using Arenio.Persistence.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Repositories
{
    public class StadiumRepository : Repository<Domain.Entities.Stadium>, Application.Abstracts.Repositories.IStadiumRepository
    {
        public StadiumRepository(ArenioDbContext context) : base(context)
        {
        }
    }
}
