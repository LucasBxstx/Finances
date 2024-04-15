using FinancesBackend;
using FinancesBackend.Common.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Filters;


var builder = WebApplication.CreateBuilder(args);

ConfigureMvc(builder.Services);
ConfigureSwagger(builder.Services);
ConfigureDbContext(builder.Services, builder.Configuration);
ConfigureAuthorization(builder.Services);
ConfigureServices(builder.Services);

var app = builder.Build();
ConfigureApp(app, app.Configuration);

await app.RunAsync();

return;

static void ConfigureDbContext(IServiceCollection services, IConfiguration configuration)
{
    services.AddDbContext<FinancesContext>(options =>
    {
        options.UseSqlServer(configuration.GetConnectionString("FinancesContext"));
    });
}

static void ConfigureAuthorization(IServiceCollection services)
{
    services.AddAuthentication().AddBearerToken(IdentityConstants.BearerScheme);
    services.AddAuthorizationBuilder();
    services.AddIdentityCore<IdentityUser>()
        .AddEntityFrameworkStores<FinancesContext>()
        .AddApiEndpoints();
}

static void ConfigureMvc(IServiceCollection services)
{
    services.AddControllers();

    services.AddMediatR(cfg => { cfg.RegisterServicesFromAssemblies(typeof(Program).Assembly); });

    services.AddResponseCaching();
    services.AddMemoryCache();

    services.AddHttpContextAccessor();
    services.AddHealthChecks();
    services.AddCors();
}

static void ConfigureSwagger(IServiceCollection services)
{
    services.AddEndpointsApiExplorer();
    services.AddSwaggerGen(options =>
    {
        options.AddSecurityDefinition("oauth2", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            In = ParameterLocation.Header,
            Name = "Authorization",
            Type = SecuritySchemeType.ApiKey
        });

        options.OperationFilter<SecurityRequirementsOperationFilter>();
    });
}

static void ConfigureServices(IServiceCollection services)
{
    services.AddSingleton<WrappedDbUpdateConcurrencyExceptionFactory>();
}

static void ConfigureApp(WebApplication webApplication, IConfiguration configuration)
{
    webApplication.UseRouting();

    webApplication.MapHealthChecks("/health");
    webApplication.MapGet("/", httpContext => httpContext.Response.WriteAsync("Backend alife")).RequireAuthorization();
    webApplication.MapControllers();

    webApplication.MapIdentityApi<IdentityUser>();
    webApplication.UseAuthorization();


    if (webApplication.Environment.IsDevelopment())
    {
        webApplication.UseDeveloperExceptionPage();

        webApplication.UseCors(
            corsPolicyBuilder => corsPolicyBuilder.AllowAnyHeader().AllowAnyOrigin().AllowAnyMethod());

        webApplication.UseSwagger();
        webApplication.UseSwaggerUI();
    }
    else
    {
        var corsOrigins = new List<string>();
        configuration.Bind("CORS", corsOrigins);

        webApplication.UseCors(
            corsPolicyBuilder => corsPolicyBuilder.WithOrigins(corsOrigins.ToArray())
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials());

        webApplication.UseHttpsRedirection();
        webApplication.UseHsts();
    }

    webApplication.UseResponseCaching();
}




