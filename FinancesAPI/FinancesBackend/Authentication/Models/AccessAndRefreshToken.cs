using System.ComponentModel.DataAnnotations;

namespace FinancesBackend.Authentication.Models
{
    public class AccessAndRefreshToken
    {
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
    }
}
