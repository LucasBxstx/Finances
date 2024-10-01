namespace FinancesBackend.Authentication.Models
{
    public class TokenRefreshRequest
    {
        public required string RefreshToken { get; set; }

        public required string UserId { get; set; }
    }
}
