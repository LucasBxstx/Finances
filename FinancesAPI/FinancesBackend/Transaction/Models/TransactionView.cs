namespace FinancesBackend.Transaction.Models
{
    public sealed class TransactionView
    {
        public double? PriorBalance { get; set; }

        public DateTimeOffset? OldestTransactionDate { get; set; }

        public List<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}
