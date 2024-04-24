using FinancesBackend.Common.Validation;
using MediatR;

namespace FinancesBackend.Labels.Queries
{
    public sealed class GetLabelQuery : IRequest<Models.Label>
    {
        [NoEmptyGuid]
        public required Guid UserId { get; set; }

        public required int Id { get; set; }
    }
}
