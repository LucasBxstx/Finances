using FinancesBackend.Common.Validation;
using MediatR;

namespace FinancesBackend.Labels.Requests
{
    public sealed class CreateOrUpdateLabelRequest : IRequest<Models.Label>
    {
        public int Id { get; set; }

        [NoEmptyGuid]
        public required Guid UserId { get; set; }

        public required string Name { get; set; }

        public required string Color { get; set; }

        public byte[]? RowVersion { get; set; }
    }
}
