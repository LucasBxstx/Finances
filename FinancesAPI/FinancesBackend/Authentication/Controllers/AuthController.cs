namespace FinancesBackend.Authentication.Controllers
{
    using FinancesBackend.Authentication.Models;
    using FinancesBackend.ApplicationUser.Models;
    using FinancesBackend.Services;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using System.Threading.Tasks;

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

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("Hello World");
        }

        [HttpGet("dbtest")]
        public IActionResult DbTest()
        {
            try
            {
                var userCount = _userManager.Users.Count();  // Zählt die Benutzer in der DB
                return Ok($"Database connection is successful. User count: {userCount}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database connection failed: {ex.Message}");
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            var user = await _userManager.FindByEmailAsync(loginRequest.Email);
            if (user == null) return Unauthorized( new { message = "Invalid email" } );

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginRequest.Password, false);
            if (!result.Succeeded) return Unauthorized( new { message = "Invalid password" });

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
            if (user == null) return Unauthorized(new { message = "Invalid refresh token" });

            if (user.RefreshToken != tokenRefreshRequest.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.Now)
            {
                return Unauthorized(new { message = "Invalid refresh token" });
            }

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
