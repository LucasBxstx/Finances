using FinancesBackend.Common.Validation;
using MediatR;

namespace FinancesBackend.Labels.Queries
{
    public sealed class GetLabelQuery : IRequest<Models.LabelDto>
    {
        public required int Id { get; set; }
    }
}
