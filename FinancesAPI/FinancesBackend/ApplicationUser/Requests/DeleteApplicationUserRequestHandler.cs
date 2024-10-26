using FinancesBackend.Common.Exceptions;
using FinancesBackend.Labels.Exceptions;
using FinancesBackend.Labels.Requests;
using FinancesBackend.Services;
using FinancesBackend.Transaction.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinancesBackend.ApplicationUser.Requests
{
    internal sealed class DeleteApplicationUserRequestHandler : IRequestHandler<DeleteApplicationUserRequest>
    {
        private readonly FinancesContext _financesContext;
        private readonly WrappedDbUpdateConcurrencyExceptionFactory _wrappedDbUpdateConcurrencyExceptionFactory;
        private readonly IJwtTokenService _jwtTokenService;

        public DeleteApplicationUserRequestHandler(
            FinancesContext financesContext,
            WrappedDbUpdateConcurrencyExceptionFactory wrappedDbUpdateConcurrencyExceptionFactory,
            IJwtTokenService jwtTokenService)
        {
            _financesContext = financesContext;
            _wrappedDbUpdateConcurrencyExceptionFactory = wrappedDbUpdateConcurrencyExceptionFactory;
            _jwtTokenService = jwtTokenService;
        }

        public async Task Handle(DeleteApplicationUserRequest request, CancellationToken cancellationToken)
        {
            var userObjectId = _jwtTokenService.GetUserObjectIdFromToken();

            var user = await _financesContext.Users.FirstOrDefaultAsync(u => u.Id == userObjectId.ToString(), cancellationToken);

            if (user == null)
            {
                throw new UserNotFoundException(userObjectId);
            }

            var labelsOfUser = await _financesContext.Labels
                    .Where(l => l.UserId == userObjectId)
                    .ToListAsync(cancellationToken);

            var transactionsOfUserl = await _financesContext.Transactions
                    .Where(t => t.UserId == userObjectId)
                    .ToListAsync(cancellationToken);

            try
            {
                labelsOfUser.ForEach(l => _financesContext.Labels.Remove(l));
                transactionsOfUserl.ForEach(t => _financesContext.Transactions.Remove(t));

                _financesContext.Users.Remove(user);

                await _financesContext.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException exception)
            {
                throw _wrappedDbUpdateConcurrencyExceptionFactory.Create(exception);
            }
        }

    }
}
