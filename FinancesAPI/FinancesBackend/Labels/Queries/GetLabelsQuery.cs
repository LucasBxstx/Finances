using FinancesBackend.Common.Validation;
using MediatR;

namespace FinancesBackend.Labels.Queries
{
    public sealed class GetLabelsQuery : IRequest<List<Models.Label>>
    {
        [NoEmptyGuid]
        public required Guid UserId { get; set; }
    }
}
