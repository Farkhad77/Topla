using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Settings
{
    public class PaginationRequest
    {
        private const int MaxPageSize = 100;

        private int _pageNumber = 1;

        public int PageNumber
        {
            get => _pageNumber;
            set => _pageNumber = value < 1 ? 1 : value;
        }

        private int _pageSize = 10;

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value < 1 ? 10 : (value > MaxPageSize ? MaxPageSize : value);
        }
    }
}
