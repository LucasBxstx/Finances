using System.ComponentModel.DataAnnotations;

namespace FinancesBackend.Labels.Models
{
    public sealed class Label
    {
        [Key] public int Id { get; set; }

        [Required] public Guid UserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Color { get; set; } = string.Empty;

        [Timestamp] public byte[]? RowVersion { get; set; }
    }
}
