using Arenio.Application.Abstracts.Rabbit;
using Arenio.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.BackgroundJobs
{
    public class OutboxProcessor : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public OutboxProcessor(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();

                var context = scope.ServiceProvider.GetRequiredService<ArenioDbContext>();

                var publisher = scope.ServiceProvider.GetRequiredService<IRabbitPublisher>();

                var messages = await context.OutboxMessages
                    .Where(x => !x.Processed)
                    .OrderBy(x => x.CreatedAt)
                    .Take(20)
                    .ToListAsync(stoppingToken);

                foreach (var message in messages)
                {
                    try
                    {
                        await publisher.PublishAsync(
                        message.Type,
                        message.Payload);

                        message.Processed = true;
                        message.ProcessedAt = DateTime.UtcNow;
                    }
                    catch
                    {
                        message.RetryCount++;
                    }
                }

                await context.SaveChangesAsync(stoppingToken);

                await Task.Delay(3000, stoppingToken);
            }
        }
    }
}
