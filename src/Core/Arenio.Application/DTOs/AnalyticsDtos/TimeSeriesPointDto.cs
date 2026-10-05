using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.DTOs.AnalyticsDtos
{
    public record class TimeSeriesPointDto
    {
        public string Label { get; set; } = string.Empty;

        public decimal Value { get; set; }
    }
}
