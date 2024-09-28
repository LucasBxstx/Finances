using System.ComponentModel.DataAnnotations;

namespace FinancesBackend.Labels.Models
{
    public sealed class LabelDto
    {
        [Key] public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Color { get; set; } = string.Empty;

        [Timestamp] public byte[]? RowVersion { get; set; }

        public static LabelDto MapFromDatabase(Label label)
        {
            return new LabelDto
            {
                Id = label.Id,
                Name = label.Name,
                Color = label.Color,
                RowVersion = label.RowVersion
            };
        }
    }
}
