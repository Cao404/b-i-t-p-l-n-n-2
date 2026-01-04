using Microsoft.AspNetCore.Mvc;

namespace SellerHub.Api.Controllers
{
    
        [ApiController]
        [Route("api/admin/test")]
        public class AdminTestControllerr : ControllerBase
        {
            [HttpGet("ping")]
            public IActionResult Ping() => Ok("OK");
        }
    }


