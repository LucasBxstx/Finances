using FinancesBackend.Common.Validation;
using FinancesBackend.Transaction.Models;
using MediatR;

namespace FinancesBackend.Transaction.Queries
{
    public sealed class GetTransactionsQuery : IRequest<TransactionView>
    {
        [NoEmptyGuid]
        public required Guid UserId { get; set; }

        public DateTimeOffset? StartDate { get; set; }

        public DateTimeOffset? EndDate { get; set; }
    }
}
