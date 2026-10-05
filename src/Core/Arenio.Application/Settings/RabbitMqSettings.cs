using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Settings
{
    public class RabbitMqSettings
    {
       
            public string Host { get; set; } = default!;
            public int Port { get; set; }
            public string UserName { get; set; } = default!;
            public string Password { get; set; } = default!;
        
    }
}
