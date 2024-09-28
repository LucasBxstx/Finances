using System.ComponentModel.DataAnnotations;

namespace FinancesBackend.Transaction.Models
{
    public sealed class TransactionDto
    {
        [Key] public int Id { get; set; }

        [Required] public TransactionType TransactionType { get; set; }

        [Required] public DateTimeOffset Date { get; set; }

        public string? Title { get; set; }

        public int? LabelId { get; set; }

        [Required] public double Price { get; set; }

        [Timestamp] public byte[]? RowVersion { get; set; }

        public static TransactionDto MapFromDatabase(Transaction transaction)
        {
            return new TransactionDto
            {
                Id = transaction.Id,
                TransactionType = transaction.TransactionType,
                Date = transaction.Date,
                Title = transaction.Title,
                LabelId = transaction.LabelId,
                Price = transaction.Price,
                RowVersion = transaction.RowVersion
            };
        }
    }
}
