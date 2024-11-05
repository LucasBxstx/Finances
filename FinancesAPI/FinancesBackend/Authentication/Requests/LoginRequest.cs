using System.ComponentModel.DataAnnotations;
using MediatR;

namespace FinancesBackend.Authentication.Requests
{
    public sealed class LoginRequest : IRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
