using MediatR;
using Microsoft.EntityFrameworkCore;
using FinancesBackend.Transaction.Exceptions;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using FinancesBackend.Services;

namespace FinancesBackend.Transaction.Queries
{
    public class GetTransactionQueryHandler : IRequestHandler<GetTransactionQuery, Models.Transaction>
    {

        private readonly FinancesContext _financesContext;
        private readonly IJwtTokenService _jwtTokenService;

        public GetTransactionQueryHandler(FinancesContext financesContext, IJwtTokenService jwtTokenService)
        {
            _financesContext = financesContext;
            _jwtTokenService = jwtTokenService;
        }
        public async Task<Models.Transaction> Handle(GetTransactionQuery request, CancellationToken cancellationToken)
        {

            var userObjectId = _jwtTokenService.GetUserObjectIdFromToken();

            var transaction = await _financesContext.Transactions.FirstOrDefaultAsync(t => t.Id == request.Id && t.UserId == userObjectId, cancellationToken);

            if (transaction == null)
            {
                throw new TransactionNotFoundException(request.Id);
            }

            return transaction;
        }
    }
}
