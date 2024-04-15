using FinancesBackend.Common.Exceptions;

namespace FinancesBackend.Transaction.Exceptions
{
    internal sealed class RowVersionMissingException : BadRequestException
    {
        public RowVersionMissingException() 
            : base("The upsert request is missing row version information.")
        {
        }

        public override string Title { get; } = "Row version missing";
    }
}
