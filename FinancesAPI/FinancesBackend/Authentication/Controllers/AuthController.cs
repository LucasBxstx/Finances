namespace FinancesBackend.Authentication.Controllers
{
    using FinancesBackend.Authentication.Models;
    using FinancesBackend.ApplicationUser.Models;
    using FinancesBackend.Services;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using System.Threading.Tasks;
    using FinancesBackend.Authentication.Exceptions;
    using FinancesBackend.Common.Exceptions;
    using FinancesBackend.Transaction.Exceptions;

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IJwtTokenService _jwtTokenService;

        public AuthController(SignInManager<ApplicationUser> signInManager, UserManager<ApplicationUser> userManager, IJwtTokenService jwtTokenService)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _jwtTokenService = jwtTokenService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            var user = await _userManager.FindByEmailAsync(loginRequest.Email);

            if (user == null) return Unauthorized(new {message = "No user with this email found"});

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginRequest.Password, false);
            if (!result.Succeeded) return Unauthorized(new { message = "Wrong password" });

            var token = _jwtTokenService.GenerateTokens(user);

            return Ok(new 
            { 
                accessToken = token.AccessToken, 
                refreshToken = token.RefreshToken,
                userId = user.Id 
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] TokenRefreshRequest tokenRefreshRequest)
        {
            var user = await _userManager.FindByIdAsync(tokenRefreshRequest.UserId);
            if (user == null) return Unauthorized(new { message = "No User with this Id was found" });

            if (user.RefreshToken != tokenRefreshRequest.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.Now)
            {
                return Unauthorized(new { message = "Invalid or expired Refresh Token" });
            }

            var newTokens = _jwtTokenService.GenerateTokens(user);

            return Ok(new
            {
                accessToken = newTokens.AccessToken,
                refreshToken = newTokens.RefreshToken,
                userId = user.Id
            });
        }
    }
}
