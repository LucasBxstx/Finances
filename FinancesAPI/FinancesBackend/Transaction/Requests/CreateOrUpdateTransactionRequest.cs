using FinancesBackend.Common.Validation;
using FinancesBackend.Transaction.Models;
using MediatR;

namespace FinancesBackend.Transaction.Requests
{
    public sealed class CreateOrUpdateTransactionRequest: IRequest<Models.Transaction>
    {
        public int Id { get; set; }

        [NoEmptyGuid]
        public required Guid UserId { get; set; }

        public required TransactionType TransactionType { get; set; }

        public required DateTimeOffset Date { get; set; }

        public string? Title { get; set; }

        public string? Label { get; set; }

        public required double Price { get; set; }

        public byte[]? RowVersion { get; set; }
    }
}
