using FinancesBackend.Common.Exceptions;

namespace FinancesBackend.Transaction.Exceptions
{
    internal sealed class UserUnauthorizedException : NotFoundException
    {
        public UserUnauthorizedException() : base("User is not authorized")
        {
        }

        public override string Title { get; } = "User is not authorized";

    }
}
