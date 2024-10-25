using MediatR;

namespace FinancesBackend.Labels.Requests
{
    public sealed class DeleteLabelRequest : IRequest
    {
        public required int Id { get; set; }
    }
}
