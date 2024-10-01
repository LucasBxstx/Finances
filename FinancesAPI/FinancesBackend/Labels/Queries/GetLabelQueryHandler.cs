using FinancesBackend.Labels.Exceptions;
using FinancesBackend.Labels.Models;
using FinancesBackend.Services;
using FinancesBackend.Transaction.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FinancesBackend.Labels.Queries
{
    internal sealed class GetLabelQueryHandler : IRequestHandler<GetLabelQuery, LabelDto>
    {
        private readonly FinancesContext _financesContext;
        private readonly IJwtTokenService _jwtTokenService;

        public GetLabelQueryHandler(FinancesContext financesContext, IJwtTokenService jwtTokenService)
        {
            _financesContext = financesContext;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<LabelDto> Handle(GetLabelQuery request, CancellationToken cancellationToken)
        {
            var userObjectId = _jwtTokenService.GetUserObjectIdFromToken();

            var user = await _financesContext.Users.SingleOrDefaultAsync(u => u.Id == userObjectId.ToString(), cancellationToken);

            if (user == null)
            {
                throw new UserNotFoundException(userObjectId);
            }

            var label = await _financesContext.Labels
                .SingleOrDefaultAsync(l => l.UserId == userObjectId && l.Id == request.Id, cancellationToken);
                
            if (label == null)
            {
                throw new LabelNotFoundException(request.Id);
            }

            return LabelDto.MapFromDatabase(label);
        }
    }
}
