using FinancesBackend.Labels.Models;
using FinancesBackend.Services;
using FinancesBackend.Transaction.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinancesBackend.Labels.Queries
{
    internal sealed class GetLabelsQueryHandler : IRequestHandler<GetLabelsQuery, List<Label>>
    {
        private readonly FinancesContext _financesContext;
        private readonly IJwtTokenService _jwtTokenService;

        public GetLabelsQueryHandler(FinancesContext financesContext, IJwtTokenService jwtTokenService)
        {
            _financesContext = financesContext;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<List<Label>> Handle(GetLabelsQuery request, CancellationToken cancellationToken)
        {
            var userObjectId = _jwtTokenService.GetUserObjectIdFromToken();

            var user = await _financesContext.Users.SingleOrDefaultAsync(u => u.Id == userObjectId.ToString(), cancellationToken);

            if (user == null)
            {
                throw new UserNotFoundException(userObjectId);
            }

            var labels = new List<Label>();

            labels = await _financesContext.Labels
                .Where(l => l.UserId == userObjectId)
                .OrderBy(l => l.Name)
                .ToListAsync(cancellationToken);

            return labels;
        }
    }
}
