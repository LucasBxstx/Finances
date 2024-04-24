using FinancesBackend.Labels.Models;
using FinancesBackend.Transaction.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinancesBackend.Labels.Queries
{
    internal sealed class GetLabelsQueryHandler : IRequestHandler<GetLabelsQuery, List<Label>>
    {
        private readonly FinancesContext _financesContext;

        public GetLabelsQueryHandler(FinancesContext financesContext)
        {
            _financesContext = financesContext;
        }

        public async Task<List<Label>> Handle(GetLabelsQuery request, CancellationToken cancellationToken)
        {
            var user = await _financesContext.Users.SingleOrDefaultAsync(u => u.Id == request.UserId.ToString(), cancellationToken);

            if (user == null)
            {
                throw new UserNotFoundException(request.UserId);
            }

            var labels = new List<Label>();

            labels = await _financesContext.Labels
                .Where(l => l.UserId == request.UserId)
                .OrderBy(l => l.Name)
                .ToListAsync(cancellationToken);

            return labels;
        }
    }
}
