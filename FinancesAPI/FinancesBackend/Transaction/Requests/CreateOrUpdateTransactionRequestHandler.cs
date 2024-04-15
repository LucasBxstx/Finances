using FinancesBackend.Common.Exceptions;
using FinancesBackend.Transaction.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinancesBackend.Transaction.Requests
{
    internal sealed class CreateOrUpdateTransactionRequestHandler : IRequestHandler<CreateOrUpdateTransactionRequest, Models.Transaction>
    {
        private readonly FinancesContext _financesContext;
        private readonly WrappedDbUpdateConcurrencyExceptionFactory _wrappedDbUpdateConcurrencyExceptionFactory;

        public CreateOrUpdateTransactionRequestHandler(
            FinancesContext financesContext, 
            WrappedDbUpdateConcurrencyExceptionFactory wrappedDbUpdateConcurrencyExceptionFactory)
        {
            _financesContext = financesContext;
            _wrappedDbUpdateConcurrencyExceptionFactory = wrappedDbUpdateConcurrencyExceptionFactory;
        }

        public async Task<Models.Transaction> Handle(CreateOrUpdateTransactionRequest request, CancellationToken cancellationToken)
        {
            var user = await _financesContext.Users.SingleOrDefaultAsync(u => u.Id == request.UserId.ToString(), cancellationToken);

            if (user == null)
            {
                throw new UserNotFoundException(request.UserId);
            }

            var transaction = await _financesContext.Transactions.SingleOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

            if (transaction != null && request.RowVersion == null)
            {
                throw new RowVersionMissingException();
            }

            if (transaction != null)
            {
                transaction.TransactionType = request.TransactionType;
                transaction.Date = request.Date;
                transaction.Title = request.Title;
                transaction.Label = request.Label;
                transaction.Price = request.Price;
                transaction.RowVersion = request.RowVersion;
            }

            if (transaction == null)
            {
                transaction = new Models.Transaction
                {
                    UserId = Guid.Parse(user.Id),
                    TransactionType = request.TransactionType,
                    Date = request.Date,
                    Title = request.Title,
                    Label = request.Label,
                    Price = request.Price
                };

                _financesContext.Transactions.Add(transaction);
            }

            try
            {
                await _financesContext.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException exception)
            {
                throw _wrappedDbUpdateConcurrencyExceptionFactory.Create(exception);
            }

            return transaction;
        }
    }
}
