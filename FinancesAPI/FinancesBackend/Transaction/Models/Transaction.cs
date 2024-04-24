using System.ComponentModel.DataAnnotations;

namespace FinancesBackend.Transaction.Models
{
    public sealed class Transaction
    {
        [Key] public int Id { get; set; }

        [Required] public Guid UserId { get; set; }

        [Required] public TransactionType TransactionType { get; set; }

        [Required] public DateTimeOffset Date { get; set; }

        public string? Title { get; set; }

        public int? LabelId { get; set; }

        [Required] public double Price { get; set; }

        [Timestamp] public byte[]? RowVersion { get; set; }
    }
}
