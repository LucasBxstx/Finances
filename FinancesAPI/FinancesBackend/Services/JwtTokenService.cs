namespace FinancesBackend.Services
{
    using System;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Security.Cryptography;
    using System.Text;
    using FinancesBackend.Authentication.Models;
    using FinancesBackend.Transaction.Exceptions;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.Extensions.Configuration;
    using Microsoft.IdentityModel.Tokens;

    public interface IJwtTokenService
    {
        TokenResponse GenerateTokens(IdentityUser user);
        Guid GetUserObjectIdFromToken();
    }

    public class JwtTokenService : IJwtTokenService
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public JwtTokenService(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        public TokenResponse GenerateTokens(IdentityUser user)
        {
            var accessToken = GenerateAccessToken(user);
            var refreshToken = GenerateRefreshToken();

            // Optional: Speichere den Refresh Token in der Datenbank (mit User ID)
            // SaveRefreshToken(user, refreshToken);

            return new TokenResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };
        }

        private string GenerateAccessToken(IdentityUser user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),  // Access Token Gültigkeit (30 Minuten)
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        public Guid GetUserObjectIdFromToken()
        {
            var token = ExtractTokenFromRequest(); // Implementiere diese Methode, um das Token aus der Anfrage zu extrahieren
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);

            var userIdString = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                throw new FormatException("The user ID from the token is not a valid Guid.");
            }

            return userId;
        }

        private string ExtractTokenFromRequest()
        {
            // Hole den Authorization-Header
            var authorizationHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault();

            // Überprüfe, ob der Header vorhanden ist und im erwarteten Format vorliegt
            if (!string.IsNullOrEmpty(authorizationHeader) && authorizationHeader.StartsWith("Bearer "))
            {
                // Extrahiere das Token, indem du "Bearer " entfernst
                return authorizationHeader.Substring("Bearer ".Length).Trim();
            }

            throw new UnauthorizedAccessException("Authorization header is missing or invalid.");
        }
    }

}
