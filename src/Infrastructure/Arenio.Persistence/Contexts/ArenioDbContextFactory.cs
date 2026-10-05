using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Contexts
{
    public class ArenioDbContextFactory : IDesignTimeDbContextFactory<ArenioDbContext>
    {
        public ArenioDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ArenioDbContext>();

            optionsBuilder.UseNpgsql(
                "Host=localhost;Port=5432;Database=ArenioDb;Username=postgres;Password=Farkhad7878");

            return new ArenioDbContext(optionsBuilder.Options);
        }
    }
}
