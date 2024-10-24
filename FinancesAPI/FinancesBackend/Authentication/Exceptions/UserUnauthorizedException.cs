using FinancesBackend.Common.Exceptions;

namespace FinancesBackend.Authentication.Exceptions
{

    internal sealed class UserUnauthorizedException : UnauthorizedException
    {
        public UserUnauthorizedException(string message) : base(message)
        {
        }

        public override string Title { get; } = "Invalid Credentials";

    }
}
