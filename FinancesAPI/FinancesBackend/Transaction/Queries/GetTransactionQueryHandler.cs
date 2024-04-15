using MediatR;
using Microsoft.EntityFrameworkCore;
using FinancesBackend.Transaction.Exceptions;

namespace FinancesBackend.Transaction.Queries
{
    public class GetTransactionQueryHandler : IRequestHandler<GetTransactionQuery, Models.Transaction>
    {

        private readonly FinancesContext _financesContext;

        public GetTransactionQueryHandler(FinancesContext financesContext)
        {
            _financesContext = financesContext;
        }
        public async Task<Models.Transaction> Handle(GetTransactionQuery request, CancellationToken cancellationToken)
        {
            var transaction = await _financesContext.Transactions.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

            if (transaction == null)
            {
                throw new TransactionNotFoundException(request.Id);
            }

            return transaction;
        }
    }
}
