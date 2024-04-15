namespace FinancesBackend.Common.OpenApi
{

    [AttributeUsage(AttributeTargets.Method, AllowMultiple = true)]
    public sealed class SwaggerRawBodyAttribute : Attribute
    {
        public string ContentType => "application/octet-stream";

        public string Format => "binary";
    }
}
