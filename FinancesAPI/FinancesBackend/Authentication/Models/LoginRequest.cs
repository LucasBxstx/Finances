using System.ComponentModel.DataAnnotations;

namespace FinancesBackend.Authentication.Models
{
    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
