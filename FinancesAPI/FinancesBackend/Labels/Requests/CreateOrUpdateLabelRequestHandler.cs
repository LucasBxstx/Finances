using FinancesBackend.Common.Exceptions;
using FinancesBackend.Services;
using FinancesBackend.Transaction.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinancesBackend.Labels.Requests
{
    internal sealed class CreateOrUpdateLabelRequestHandler : IRequestHandler<CreateOrUpdateLabelRequest, Models.Label>
    {
        private readonly FinancesContext _financesContext;
        private readonly WrappedDbUpdateConcurrencyExceptionFactory _wrappedDbUpdateConcurrencyExceptionFactory;
        private readonly IJwtTokenService _jwtTokenService;

        public CreateOrUpdateLabelRequestHandler(
            FinancesContext financesContext, 
            WrappedDbUpdateConcurrencyExceptionFactory wrappedDbUpdateConcurrencyExceptionFactory,
            IJwtTokenService jwtTokenService)
        {
            _financesContext = financesContext;
            _wrappedDbUpdateConcurrencyExceptionFactory = wrappedDbUpdateConcurrencyExceptionFactory;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<Models.Label> Handle(CreateOrUpdateLabelRequest request, CancellationToken cancellationToken)
        {
            var userObjectId = _jwtTokenService.GetUserObjectIdFromToken();

            var user = await _financesContext.Users.SingleOrDefaultAsync(u => u.Id ==userObjectId.ToString(), cancellationToken);

            if (user == null)
            {
                throw new UserNotFoundException(userObjectId);
            }

            var label = await _financesContext.Labels.SingleOrDefaultAsync(l => l.Id == request.Id && l.UserId == userObjectId, cancellationToken);

            if (label != null && request.RowVersion == null)
            {
                throw new RowVersionMissingException();
            }

            if (label != null)
            {
                label.Name = request.Name;
                label.Color = request.Color;
                label.RowVersion = request.RowVersion;
            }

            if (label == null)
            {
                label = new Models.Label
                {
                    UserId = Guid.Parse(user.Id),
                    Name = request.Name,
                    Color = request.Color
                };

                _financesContext.Labels.Add(label);
            }

            try
            {
                await _financesContext.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException exception)
            {
                throw _wrappedDbUpdateConcurrencyExceptionFactory.Create(exception);
            }

            return label;
        }
    }
}
