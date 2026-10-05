using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client.Events;
using RabbitMQ.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Arenio.Application.Abstracts.Services;
using System.Text.Json;
using Arenio.Application.DTOs.BookingDtos;

namespace Arenio.Persistence.BackgroundJobs
{
    public class BookingDeletedConsumer : BackgroundService
    {
        private readonly IConnection _connection;
        private readonly IServiceScopeFactory _scopeFactory;
        private IModel _channel;

        public BookingDeletedConsumer(
            IConnection connection,
            IServiceScopeFactory scopeFactory)
        {
            _connection = connection;
            _scopeFactory = scopeFactory;

            _channel = _connection.CreateModel();

            _channel.QueueDeclare(
                "booking.deleted",
                durable: true,
                exclusive: false,
                autoDelete: false);
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var consumer = new EventingBasicConsumer(_channel);

            consumer.Received += async (_, ea) =>
            {
                var json = Encoding.UTF8.GetString(ea.Body.ToArray());

                var dto = JsonSerializer.Deserialize<BookingDeletedEventDto>(json);

                using var scope = _scopeFactory.CreateScope();

                var emailService =
                    scope.ServiceProvider.GetRequiredService<IEmailService>();

                await emailService.SendBookingDeletedEmailAsync(dto!);

                _channel.BasicAck(ea.DeliveryTag, false);
            };

            _channel.BasicConsume(
                "booking.deleted",
                autoAck: false,
                consumer);

            return Task.CompletedTask;
        }
    }
}
