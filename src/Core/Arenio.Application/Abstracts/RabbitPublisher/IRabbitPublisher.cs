using Arenio.Application.DTOs.BookingDtos;
using Arenio.Application.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Abstracts.Rabbit
{
    public interface IRabbitPublisher
    {
        Task PublishAsync(string queueName, string payload);
    }
}
