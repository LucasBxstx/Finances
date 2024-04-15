namespace FinancesBackend.Common.Exceptions
{
    public abstract class BadRequestException : ApiException
    {
        protected BadRequestException(string message) : base(message)
        {
        }
    }
}
