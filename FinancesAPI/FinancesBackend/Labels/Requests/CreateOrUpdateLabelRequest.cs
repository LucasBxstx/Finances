using FinancesBackend.Common.Validation;
using MediatR;

namespace FinancesBackend.Labels.Requests
{
    public sealed class CreateOrUpdateLabelRequest : IRequest<Models.LabelDto>
    {
        public int Id { get; set; }

        public required string Name { get; set; }

        public required string Color { get; set; }

        public byte[]? RowVersion { get; set; }
    }
}
