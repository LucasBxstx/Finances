using Microsoft.EntityFrameworkCore;

namespace FinancesBackend.Services
{
    public interface IDbInitializer
    {
        Task InitializeAsync();
    }
    
    public class DbInitializer : IDbInitializer
    {
        private readonly FinancesContext _financesContext;

        public DbInitializer(FinancesContext financesContext)
        {
            _financesContext = financesContext;
        }

        public async Task InitializeAsync()
        {
            try
            {
                await _financesContext.Database.MigrateAsync();
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception.Message);
            }
        }
    }
}
