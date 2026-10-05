using Arenio.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Contexts
{
    public class ArenioDbContext : IdentityDbContext<User>
    {
        public ArenioDbContext(DbContextOptions<ArenioDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ArenioDbContext).Assembly);
            base.OnModelCreating(modelBuilder);

        }
       public DbSet<Stadium> Stadiums { get; set; }
    
       public DbSet<Booking> Bookings
        {
            get; set;
        }
       public DbSet<Payment> Payments
        {
            get; set;
        }
        public DbSet<StadiumOwnerProfile> StadiumOwnerProfiles { get; set; }
        public DbSet<OwnerRequest> OwnerRequests { get; set; }
        public DbSet<OutboxMessage> OutboxMessages { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<StadiumImage> StadiumImages { get; set; }
        public DbSet<StadiumBlockedSlot> StadiumBlockedSlots { get; set; }
        public DbSet<BusinessWorker> BusinessWorkers { get; set; }
    }
}
