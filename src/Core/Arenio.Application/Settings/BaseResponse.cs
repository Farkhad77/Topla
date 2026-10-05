using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Arenio.Application.Settings
{
    public class BaseResponse<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T Data { get; set; }
        public HttpStatusCode StatusCode { get; set; }


       
        public BaseResponse(string message, HttpStatusCode statusCode)
        {
            Message = message;
            Success = false;
            StatusCode = statusCode;
        }
        public BaseResponse(string message, bool isSuccess, HttpStatusCode statusCode)
        {
            Message = message;
            Success = isSuccess;
            StatusCode = statusCode;
        }

        public BaseResponse(T data, string message, HttpStatusCode statusCode)
        {
            Data = data;
            Message = message;
            StatusCode = statusCode;
            Success = true;
        }
        public BaseResponse(T data, string message, HttpStatusCode statusCode, bool success = true)
        {
            Data = data;
            Message = message;
            StatusCode = statusCode;
            Success = success;
        }
    }
}
