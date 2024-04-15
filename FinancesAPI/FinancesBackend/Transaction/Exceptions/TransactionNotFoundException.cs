using FinancesBackend.Common.Exceptions;

namespace FinancesBackend.Transaction.Exceptions
{
    internal sealed class TransactionNotFoundException : NotFoundException
    {
        public TransactionNotFoundException(int TransactionId) : base($"Transaction with Id {TransactionId} was not found")
        {
            Id = TransactionId;
        }

        public override string Title { get; } = "Transaction not found";

        public int Id { get; }
    }
}
