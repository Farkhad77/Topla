using Arenio.Application.Abstracts.Repositories;
using Arenio.Persistence.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Repositories
{
    public class BookingRepository : Repository<Domain.Entities.Booking>, Application.Abstracts.Repositories.IBookingRepository
    {
        public BookingRepository(ArenioDbContext context) : base(context)
        {
        }
    }
}
