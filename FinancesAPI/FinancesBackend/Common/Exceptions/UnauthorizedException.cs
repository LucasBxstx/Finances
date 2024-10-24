namespace FinancesBackend.Common.Exceptions
{
    public abstract class UnauthorizedException : ApiException
    {
        protected UnauthorizedException(string message) : base(message)
        {
        }
    }
}
