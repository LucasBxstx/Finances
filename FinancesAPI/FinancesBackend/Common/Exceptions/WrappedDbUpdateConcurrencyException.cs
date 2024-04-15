using Microsoft.EntityFrameworkCore;

namespace FinancesBackend.Common.Exceptions
{
    internal abstract class WrappedDbUpdateConcurrencyException : Exception
    {
        public const string Title = "Database Update Concurrency Exception";

        protected WrappedDbUpdateConcurrencyException(DbUpdateConcurrencyException? innerException)
            : base("A database update concurrency exception occurred. See inner exception for details", innerException)
        {
        }
    }
}
