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
            // Validierung des Refresh Tokens (optional: Überprüfen gegen Datenbank)

            // Hier würdest du das Refresh Token validieren und ggf. ein neues Access Token erzeugen
            var user = await _userManager.FindByIdAsync(tokenRefreshRequest.UserId);
            if (user == null) return Unauthorized("Invalid refresh token or user not found");

            // Neue Tokens generieren
            var newTokens = _jwtTokenService.GenerateTokens(user);

            // Neue Tokens zurückgeben
            return Ok(new
            {
                accessToken = newTokens.AccessToken,
                refreshToken = newTokens.RefreshToken,
                userId = user.Id
            });
        }
    }
}
