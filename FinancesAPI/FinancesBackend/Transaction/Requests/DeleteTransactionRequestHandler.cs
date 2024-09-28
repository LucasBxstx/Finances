using FinancesBackend.Common.Exceptions;
using FinancesBackend.Services;
using FinancesBackend.Transaction.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinancesBackend.Transaction.Requests
{
    internal sealed class DeleteTransactionRequestHandler : IRequestHandler<DeleteTransactionRequest>
    {
        private readonly FinancesContext _financesContext;
        private readonly WrappedDbUpdateConcurrencyExceptionFactory _wrappedDbUpdateConcurrencyExceptionFactory;
        private readonly IJwtTokenService _jwtTokenService;

        public DeleteTransactionRequestHandler(
            FinancesContext financesContext,
            WrappedDbUpdateConcurrencyExceptionFactory wrappedDbUpdateConcurrencyExceptionFactory,
            IJwtTokenService jwtTokenService)
        {
            _financesContext = financesContext;
            _wrappedDbUpdateConcurrencyExceptionFactory = wrappedDbUpdateConcurrencyExceptionFactory;
            _jwtTokenService = jwtTokenService;
        }

        public async Task Handle(DeleteTransactionRequest request, CancellationToken cancellationToken)
        {
            var userObjectId = _jwtTokenService.GetUserObjectIdFromToken();

            var transaction = await _financesContext.Transactions.FirstOrDefaultAsync(t => t.Id == request.Id && t.UserId == userObjectId, cancellationToken);

            if (transaction == null)
            {
                throw new TransactionNotFoundException(request.Id);
            }

            try
            {
                _financesContext.Transactions.Remove(transaction);
                await _financesContext.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException exception)
            {
                throw _wrappedDbUpdateConcurrencyExceptionFactory.Create(exception);
            } 
        }

    }
}
