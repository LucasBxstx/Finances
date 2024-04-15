using Microsoft.OpenApi.Models;

using Swashbuckle.AspNetCore.SwaggerGen;

namespace FinancesBackend.Common.OpenApi
{
    public sealed class SwaggerRawBodyFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var attributes = context.MethodInfo.GetCustomAttributes(typeof(SwaggerRawBodyAttribute), inherit: false);

            if(attributes.Length == 0)
            {
                return;
            }

            operation.RequestBody = new OpenApiRequestBody { Required = true };

            foreach (var attribute in attributes.Cast<SwaggerRawBodyAttribute>())
            {
                operation.RequestBody.Content.Add(
                    attribute.ContentType,
                    new OpenApiMediaType
                    {
                        Schema = new OpenApiSchema
                        {
                            Type = "string",
                            Format = attribute.Format,
                        },
                    });
            }
        }
    }
}
