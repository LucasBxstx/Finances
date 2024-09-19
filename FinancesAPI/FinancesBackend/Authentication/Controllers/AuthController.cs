namespace FinancesBackend.Authentication.Controllers
{
    using FinancesBackend.Authentication.Models;
    using FinancesBackend.Services;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using System.Threading.Tasks;

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IJwtTokenService _jwtTokenService;

        public AuthController(SignInManager<IdentityUser> signInManager, UserManager<IdentityUser> userManager, IJwtTokenService jwtTokenService)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _jwtTokenService = jwtTokenService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            var user = await _userManager.FindByEmailAsync(loginRequest.Email);
            if (user == null) return Unauthorized("Invalid credentials");

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginRequest.Password, false);
            if (!result.Succeeded) return Unauthorized("Invalid credentials");

            var token = _jwtTokenService.GenerateToken(user); // Generate your JWT here

            // Return token and UserId
            return Ok(new { accessToken = token, userId = user.Id });
        }
    }
}
