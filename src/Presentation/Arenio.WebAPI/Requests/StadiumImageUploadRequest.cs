namespace Arenio.WebAPI.Requests
  
{
    using Microsoft.AspNetCore.Http;
    public class StadiumImageUploadRequest
    {

        public Guid StadiumId { get; set; }

        public List<IFormFile> Images { get; set; } = [];
    }
}
