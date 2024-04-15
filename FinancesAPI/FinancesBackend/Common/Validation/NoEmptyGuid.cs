using System.ComponentModel.DataAnnotations;

namespace FinancesBackend.Common.Validation
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
    public sealed class NoEmptyGuid : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            return value != null && (Guid)value != Guid.Empty;
        }
    }
}
