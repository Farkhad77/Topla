using Arenio.Persistence.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Repositories
{
    public class ReviewRepository : Repository<Domain.Entities.Review>, Application.Abstracts.Repositories.IReviewRepository
    {
        public ReviewRepository(ArenioDbContext context) : base(context)
        {
        }
    }
}
