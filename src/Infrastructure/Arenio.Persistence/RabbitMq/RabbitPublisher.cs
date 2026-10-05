using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Persistence.Rabbit
{
    using System.Text;
    using Arenio.Application.Abstracts.Rabbit;
    using RabbitMQ.Client;

    public sealed class RabbitPublisher : IRabbitPublisher, IDisposable
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;
        private bool _disposed;

        public RabbitPublisher(IConnection connection)
        {
            _connection = connection ?? throw new ArgumentNullException(nameof(connection));
            _channel = _connection.CreateModel();
        }

        public Task PublishAsync(string queueName, string payload)
        {
            if (string.IsNullOrWhiteSpace(queueName))
                throw new ArgumentException("Queue name cannot be empty.", nameof(queueName));

            if (string.IsNullOrWhiteSpace(payload))
                throw new ArgumentException("Payload cannot be empty.", nameof(payload));

          
            _channel.QueueDeclare(
                queue: queueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null);

            var properties = _channel.CreateBasicProperties();
            properties.Persistent = true;

            var body = Encoding.UTF8.GetBytes(payload);

            _channel.BasicPublish(
                exchange: "",
                routingKey: queueName,
                basicProperties: properties,
                body: body);

            return Task.CompletedTask;
        }

        public void Dispose()
        {
            if (_disposed)
                return;

            _channel?.Close();
            _channel?.Dispose();

            _disposed = true;
        }
    }

}



