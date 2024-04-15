using MediatR;

namespace FinancesBackend.Transaction.Queries
{
    public sealed class GetTransactionQuery : IRequest<Models.Transaction>
    {
        public required int Id { get; init; }
    }
}
