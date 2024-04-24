using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FinancesBackend
{
    public class FinancesContext : IdentityDbContext
    {
        public FinancesContext(DbContextOptions<FinancesContext> contextOptions) : base(contextOptions)
        {
        }

        public DbSet<Transaction.Models.Transaction> Transactions { get; set; } = null!;

        public DbSet<Labels.Models.Label> Labels { get; set; } = null!;
    }
}
