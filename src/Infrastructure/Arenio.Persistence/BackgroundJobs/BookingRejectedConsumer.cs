using Arenio.Application.Abstracts.Services;
using Arenio.Application.DTOs.BookingDtos;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client.Events;
using RabbitMQ.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;

namespace Arenio.Persistence.BackgroundJobs
{
    public class BookingRejectedConsumer : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConnection _connection;

        public BookingRejectedConsumer(
            IConnection connection,
            IServiceScopeFactory scopeFactory)
        {
            _connection = connection;
            _scopeFactory = scopeFactory;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var channel = _connection.CreateModel();

            channel.QueueDeclare(
                queue: nameof(BookingRejectedEventDto),
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null);

            var consumer = new EventingBasicConsumer(channel);

            consumer.Received += async (_, ea) =>
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();

                    var emailService = scope.ServiceProvider
                        .GetRequiredService<IEmailService>();

                    var json = Encoding.UTF8.GetString(ea.Body.ToArray());

                    var dto = JsonSerializer.Deserialize<BookingRejectedEventDto>(json);

                    if (dto is null)
                        return;

                    await emailService.SendBookingRejectedEmailAsync(dto);

                    channel.BasicAck(ea.DeliveryTag, false);
                }
                catch
                {
                    channel.BasicNack(ea.DeliveryTag, false, true);
                }
            };

            channel.BasicConsume(
                queue: nameof(BookingRejectedEventDto),
                autoAck: false,
                consumer: consumer);

            return Task.CompletedTask;
        }
    }
}
