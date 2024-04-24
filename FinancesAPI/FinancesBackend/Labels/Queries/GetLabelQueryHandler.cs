using FinancesBackend.Labels.Exceptions;
using FinancesBackend.Labels.Models;
using FinancesBackend.Transaction.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinancesBackend.Labels.Queries
{
    internal sealed class GetLabelQueryHandler : IRequestHandler<GetLabelQuery, Label>
    {
        private readonly FinancesContext _financesContext;

        public GetLabelQueryHandler(FinancesContext financesContext)
        {
            _financesContext = financesContext;
        }

        public async Task<Label> Handle(GetLabelQuery request, CancellationToken cancellationToken)
        {
            var user = await _financesContext.Users.SingleOrDefaultAsync(u => u.Id == request.UserId.ToString(), cancellationToken);

            if (user == null)
            {
                throw new UserNotFoundException(request.UserId);
            }

            var label = await _financesContext.Labels
                .SingleOrDefaultAsync(l => l.UserId == request.UserId && l.Id == request.Id, cancellationToken);
                
            if (label == null)
            {
                throw new LabelNotFoundException(request.Id);
            }

            return label;
        }
    }
}
