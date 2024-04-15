namespace FinancesBackend.Common.Exceptions
{
    public abstract class NotFoundException : ApiException
    {
        protected NotFoundException(string message) : base(message)
        {
        }
    }
}
