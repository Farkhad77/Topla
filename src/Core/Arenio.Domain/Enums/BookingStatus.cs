using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Domain.Enums
{
    public enum BookingStatus
    {
        // Pending artıq yeni bookinqlər üçün istifadə olunmur (owner təsdiqi silinib);
        // dəyər köhnə sətirlərlə uyğunluq üçün saxlanılır.
        Pending = 0,
        Confirmed = 1,
        Cancelled = 2,
        Completed = 3
    }
}
