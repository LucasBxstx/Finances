using FinancesBackend.Transaction.Exceptions;
using FinancesBackend.Transaction.Models;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FinancesBackend.Transaction.Queries
{
    internal sealed class GetTransactionsQueryHandler : IRequestHandler<GetTransactionsQuery, TransactionView>
    {
        private readonly FinancesContext _financesContext;

        public GetTransactionsQueryHandler(FinancesContext financesContext)
        {
            _financesContext = financesContext;
        }

        public async Task<TransactionView> Handle(GetTransactionsQuery request, CancellationToken cancellationToken)
        {
            // ToDo: get User Id from the token 
            // see: https://medium.com/@codewithankitsahu/authentication-and-authorization-in-net-8-web-api-94dda49516ee

            var user = await _financesContext.Users.SingleOrDefaultAsync(u => u.Id == request.UserId.ToString(), cancellationToken);

            if(user == null)
            {
                throw new UserNotFoundException(request.UserId);
            }

            var transactions = new List<Models.Transaction>();

            if (request.StartDate == null && request.EndDate == null)
            {
                transactions = await _financesContext.Transactions
                    .Where(t => t.UserId == request.UserId)
                    .ToListAsync(cancellationToken);
            }
            else
            {
                transactions =  await _financesContext.Transactions
                    .Where(t => t.UserId == request.UserId && t.Date >= request.StartDate && t.Date <= request.EndDate)
                    .ToListAsync(cancellationToken);
            }

            
            var transactionView = new TransactionView
            {
                Transactions = transactions,
                PriorBalance = null,
                OldestTransactionDate = null,
            };


            if (request.StartDate != null && request.EndDate != null)
            {
                var transactionsPriorDate = await _financesContext.Transactions
                    .Where(t => t.UserId == request.UserId && t.Date < request.StartDate)
                    .ToListAsync(cancellationToken);

                var priorBalance = transactionsPriorDate.Sum(t => t.TransactionType == TransactionType.Income ? t.Price : -t.Price);
                var oldestTransactionDate = transactionsPriorDate.Min(t => t.Date);

                transactionView.PriorBalance = priorBalance;
                transactionView.OldestTransactionDate = oldestTransactionDate;
            }

            return transactionView;
        }
    }
}
