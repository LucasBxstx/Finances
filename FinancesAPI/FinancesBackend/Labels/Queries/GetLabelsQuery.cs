using FinancesBackend.Common.Validation;
using MediatR;

namespace FinancesBackend.Labels.Queries
{
    public sealed class GetLabelsQuery : IRequest<List<Models.LabelDto>>
    {
    }
}
