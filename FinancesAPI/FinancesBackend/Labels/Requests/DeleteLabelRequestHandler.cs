using FinancesBackend.Common.Exceptions;
using FinancesBackend.Labels.Exceptions;
using FinancesBackend.Services;
using FinancesBackend.Transaction.Exceptions;
using FinancesBackend.Transaction.Requests;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinancesBackend.Labels.Requests
{
    internal sealed class DeleteLabelRequestHandler : IRequestHandler<DeleteLabelRequest>
    {
        private readonly FinancesContext _financesContext;
        private readonly WrappedDbUpdateConcurrencyExceptionFactory _wrappedDbUpdateConcurrencyExceptionFactory;
        private readonly IJwtTokenService _jwtTokenService;

        public DeleteLabelRequestHandler(
            FinancesContext financesContext,
            WrappedDbUpdateConcurrencyExceptionFactory wrappedDbUpdateConcurrencyExceptionFactory,
            IJwtTokenService jwtTokenService)
        {
            _financesContext = financesContext;
            _wrappedDbUpdateConcurrencyExceptionFactory = wrappedDbUpdateConcurrencyExceptionFactory;
            _jwtTokenService = jwtTokenService;
        }

        public async Task Handle(DeleteLabelRequest request, CancellationToken cancellationToken)
        {
            var userObjectId = _jwtTokenService.GetUserObjectIdFromToken();

            var label = await _financesContext.Labels.FirstOrDefaultAsync(l => l.Id == request.Id && l.UserId == userObjectId, cancellationToken);

            if (label == null)
            {
                throw new LabelNotFoundException(request.Id);
            }

            var transactionsWithThisLabel = await _financesContext.Transactions
                    .Where(t => t.UserId == userObjectId && t.LabelId == request.Id)
                    .ToListAsync(cancellationToken);

            transactionsWithThisLabel.ForEach(t => t.LabelId = null);

            try
            {
                _financesContext.Labels.Remove(label);
                await _financesContext.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException exception)
            {
                throw _wrappedDbUpdateConcurrencyExceptionFactory.Create(exception);
            }
        }

    }
}
