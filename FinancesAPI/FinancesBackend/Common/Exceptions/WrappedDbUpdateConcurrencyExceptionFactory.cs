using Microsoft.EntityFrameworkCore;

namespace FinancesBackend.Common.Exceptions
{
    internal sealed class WrappedDbUpdateConcurrencyExceptionFactory
    {
        private readonly IWebHostEnvironment _webHostEnvironment;

        public WrappedDbUpdateConcurrencyExceptionFactory(IWebHostEnvironment webHostEnvironment)
        {
            _webHostEnvironment = webHostEnvironment;
        }

        public WrappedDbUpdateConcurrencyException Create(DbUpdateConcurrencyException innerException)
        {
            return new WrappedDbUpdateConcurrentyExceptionImplementation(
                _webHostEnvironment.IsDevelopment() ? innerException : null);
        }

        private sealed class WrappedDbUpdateConcurrentyExceptionImplementation: WrappedDbUpdateConcurrencyException
        {
            public WrappedDbUpdateConcurrentyExceptionImplementation(DbUpdateConcurrencyException? innerException)
                : base(innerException)
            {
            }
        }
    }
}
