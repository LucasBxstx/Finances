using FinancesBackend.Common.Validation;
using FinancesBackend.Transaction.Models;
using MediatR;

namespace FinancesBackend.Transaction.Requests
{
    public sealed class CreateOrUpdateTransactionRequest: IRequest<Models.TransactionDto>
    {
        public int Id { get; set; }

        public required TransactionType TransactionType { get; set; }

        public required DateTimeOffset Date { get; set; }

        public string? Title { get; set; }

        public int? LabelId { get; set; }

        public required double Price { get; set; }

        public byte[]? RowVersion { get; set; }
    }
}
