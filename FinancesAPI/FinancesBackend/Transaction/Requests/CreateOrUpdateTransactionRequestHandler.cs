using FinancesBackend.Common.Exceptions;
using FinancesBackend.Services;
using FinancesBackend.Transaction.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinancesBackend.Transaction.Requests
{
    internal sealed class CreateOrUpdateTransactionRequestHandler : IRequestHandler<CreateOrUpdateTransactionRequest, Models.Transaction>
    {
        private readonly FinancesContext _financesContext;
        private readonly WrappedDbUpdateConcurrencyExceptionFactory _wrappedDbUpdateConcurrencyExceptionFactory;
        private readonly IJwtTokenService _jwtTokenService;

        public CreateOrUpdateTransactionRequestHandler(
            FinancesContext financesContext, 
            WrappedDbUpdateConcurrencyExceptionFactory wrappedDbUpdateConcurrencyExceptionFactory,
            IJwtTokenService jwtTokenService)
        {
            _financesContext = financesContext;
            _wrappedDbUpdateConcurrencyExceptionFactory = wrappedDbUpdateConcurrencyExceptionFactory;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<Models.Transaction> Handle(CreateOrUpdateTransactionRequest request, CancellationToken cancellationToken)
        {
            var userObjectId = _jwtTokenService.GetUserObjectIdFromToken();

            var user = await _financesContext.Users.SingleOrDefaultAsync(u => u.Id == userObjectId.ToString(), cancellationToken);

            if (user == null)
            {
                throw new UserNotFoundException(userObjectId);
            }

            var transaction = await _financesContext.Transactions.SingleOrDefaultAsync(t => t.Id == request.Id && t.UserId == userObjectId, cancellationToken);

            if (transaction != null && request.RowVersion == null)
            {
                throw new RowVersionMissingException();
            }

            if (transaction != null)
            {
                transaction.TransactionType = request.TransactionType;
                transaction.Date = request.Date;
                transaction.Title = request.Title;
                transaction.LabelId = request.LabelId;
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
                    LabelId = request.LabelId,
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
