using FinancesBackend;
using FinancesBackend.Common.Exceptions;
using FinancesBackend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Filters;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

ConfigureMvc(builder.Services);
ConfigureSwagger(builder.Services);
ConfigureDbContext(builder.Services, builder.Configuration);
ConfigureAuthorization(builder.Services, builder.Configuration);
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

static void ConfigureAuthorization(IServiceCollection services, IConfiguration configuration)
{
    // JWT Authentication configuration
    var jwtSettings = configuration.GetSection("Jwt");
    var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]);

    services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            ClockSkew = TimeSpan.Zero // Token expiration time precision
        };
    });

    services.AddAuthorization();
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

/*static void ConfigureSwagger(IServiceCollection services)
{
    services.AddEndpointsApiExplorer();
    services.AddSwaggerGen(options =>
    {
        options.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
        {
            In = ParameterLocation.Header,
            Name = "Authorization",
            Type = SecuritySchemeType.ApiKey
        });

        options.OperationFilter<SecurityRequirementsOperationFilter>();

        // Weitere Swagger-Konfigurationsoptionen
        options.SwaggerDoc("v1", new OpenApiInfo { Title = "Finances API", Version = "v1" });
    });
}*/
static void ConfigureSwagger(IServiceCollection services)
{
    services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo { Title = "Finances API", Version = "v1" });

        // Entferne Konflikte durch Ignorieren bestimmter Typen
        options.IgnoreObsoleteActions();
        options.IgnoreObsoleteProperties();

        // Füge Unterstützung für andere Formate hinzu, wenn notwendig
        options.DescribeAllParametersInCamelCase();
        options.CustomSchemaIds(type => type.FullName); // Vermeidet Namenskonflikte
    });
}


static void ConfigureServices(IServiceCollection services)
{
    services.AddSingleton<WrappedDbUpdateConcurrencyExceptionFactory>();

    services.AddScoped<IJwtTokenService, JwtTokenService>();
}

static void ConfigureApp(WebApplication webApplication, IConfiguration configuration)
{
    webApplication.UseRouting();

    webApplication.MapHealthChecks("/health");
    webApplication.MapGet("/", httpContext => httpContext.Response.WriteAsync("Backend alife")).RequireAuthorization();
    webApplication.MapControllers();

    webApplication.MapIdentityApi<IdentityUser>();
    webApplication.UseAuthentication();
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




