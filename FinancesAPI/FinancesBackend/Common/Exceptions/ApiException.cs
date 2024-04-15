namespace FinancesBackend.Common.Exceptions
{
    public abstract class ApiException : Exception
    {
        protected ApiException(string message) : base(message)
        {
        }

        public abstract string Title { get; }
    }
}
