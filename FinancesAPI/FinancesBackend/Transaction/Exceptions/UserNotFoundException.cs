using FinancesBackend.Common.Exceptions;

namespace FinancesBackend.Transaction.Exceptions
{
    internal sealed class UserNotFoundException : NotFoundException
    {
        public UserNotFoundException(Guid UserId) : base($"User with Id {UserId} was not found")
        {
            Id = UserId;
        }

        public override string Title { get; } = "User not found";

        public Guid Id { get; }
    }
}
