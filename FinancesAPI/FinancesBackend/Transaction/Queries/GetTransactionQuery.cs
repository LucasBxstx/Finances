using MediatR;

namespace FinancesBackend.Transaction.Queries
{
    public sealed class GetTransactionQuery : IRequest<Models.TransactionDto>
    {
        public required int Id { get; init; }
    }
}
