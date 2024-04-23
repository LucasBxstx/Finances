using MediatR;

namespace FinancesBackend.Transaction.Requests
{
    public sealed class DeleteTransactionRequest : IRequest
    {
        public required int Id { get; set; }
    }
}
