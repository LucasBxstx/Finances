using FinancesBackend.Common.Exceptions;

namespace FinancesBackend.Labels.Exceptions
{
    internal sealed class LabelNotFoundException : NotFoundException
    {
        public LabelNotFoundException(int LabelId) : base($"Label with Id {LabelId} was not found")
        {
            Id = LabelId;
        }

        public override string Title { get; } = "Label not found";

        public int Id { get; }
    }
}
