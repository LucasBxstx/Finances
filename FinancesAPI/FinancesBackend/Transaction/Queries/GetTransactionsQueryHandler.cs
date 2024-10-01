using FinancesBackend.Services;
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
        private readonly IJwtTokenService _jwtTokenService;

        public GetTransactionsQueryHandler(FinancesContext financesContext, IJwtTokenService jwtTokenService)
        {
            _financesContext = financesContext;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<TransactionView> Handle(GetTransactionsQuery request, CancellationToken cancellationToken)
        {
            // ToDo: get User Id from the token 
            // see: https://medium.com/@codewithankitsahu/authentication-and-authorization-in-net-8-web-api-94dda49516ee
            var userObjectId = _jwtTokenService.GetUserObjectIdFromToken();

            var user = await _financesContext.Users.SingleOrDefaultAsync(u => u.Id == userObjectId.ToString(), cancellationToken);

            if(user == null)
            {
                throw new UserNotFoundException(userObjectId);
            }

            var transactions = new List<Models.Transaction>();

            if (request.StartDate == null || request.EndDate == null)
            {
                transactions = await _financesContext.Transactions
                    .Where(t => t.UserId == userObjectId)
                    .OrderBy(t => t.Date)
                    .ToListAsync(cancellationToken);
            }
            else
            {
                transactions =  await _financesContext.Transactions
                    .Where(t => t.UserId == userObjectId && t.Date >= request.StartDate && t.Date <= request.EndDate)
                    .OrderBy(t => t.Date)
                    .ToListAsync(cancellationToken);
            }

            var transactionsDto = transactions.Select(Models.TransactionDto.MapFromDatabase).ToList();

            
            var transactionView = new TransactionView
            {
                Transactions = transactionsDto,
                PriorBalance = null,
                OldestTransactionDate = null,
            };


            if (request.StartDate != null && request.EndDate != null)
            {
                var transactionsPriorDate = await _financesContext.Transactions
                    .Where(t => t.UserId == userObjectId && t.Date < request.StartDate)
                    .ToListAsync(cancellationToken);

                var priorBalance = transactionsPriorDate.Sum(t => t.TransactionType == TransactionType.Income ? t.Price : -t.Price);

   
                if (transactionsPriorDate.Count == 0 && transactions.Count != 0)
                {
                    transactionView.OldestTransactionDate = transactions.Min(t => t.Date);
                }
                else if (transactionsPriorDate.Count != 0)
                {
                    transactionView.OldestTransactionDate = transactionsPriorDate.Min(t => t.Date);
                }

                transactionView.PriorBalance = priorBalance;
            }
            else
            {
                transactionView.OldestTransactionDate = transactions.Min(t => t.Date);
            }

            return transactionView;
        }
    }
}
