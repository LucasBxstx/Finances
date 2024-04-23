using FinancesBackend.Common.Exceptions;
using FinancesBackend.Transaction.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinancesBackend.Transaction.Requests
{
    internal sealed class DeleteTransactionRequestHandler : IRequestHandler<DeleteTransactionRequest>
    {
        private readonly FinancesContext _financesContext;
        private readonly WrappedDbUpdateConcurrencyExceptionFactory _wrappedDbUpdateConcurrencyExceptionFactory;

        public DeleteTransactionRequestHandler(
            FinancesContext financesContext,
            WrappedDbUpdateConcurrencyExceptionFactory wrappedDbUpdateConcurrencyExceptionFactory)
        {
            _financesContext = financesContext;
            _wrappedDbUpdateConcurrencyExceptionFactory = wrappedDbUpdateConcurrencyExceptionFactory;
        }

        public async Task Handle(DeleteTransactionRequest request, CancellationToken cancellationToken)
        {
            var transaction = await _financesContext.Transactions.FindAsync(request.Id);

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
