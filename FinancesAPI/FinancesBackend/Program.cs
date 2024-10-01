using FinancesBackend;
using FinancesBackend.Common.Exceptions;
using FinancesBackend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
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
            ClockSkew = TimeSpan.Zero 
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

    services.AddCors(options =>
    {
        options.AddPolicy("AllowAllOrigins",
            builder =>
            {
                builder
                    .AllowAnyOrigin()
                    .AllowAnyMethod() 
                    .AllowAnyHeader(); 
            });
    });
}

static void ConfigureSwagger(IServiceCollection services)
{
    services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo { Title = "Finances API", Version = "v1" });

        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            In = ParameterLocation.Header,
            Description = "Bitte das Bearer-Token einfügen.",
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer"
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });

        options.IgnoreObsoleteActions();
        options.IgnoreObsoleteProperties();

        options.DescribeAllParametersInCamelCase();
        options.CustomSchemaIds(type => type.FullName);
    });
}


static void ConfigureServices(IServiceCollection services)
{
    services.AddHttpContextAccessor();
    services.AddSingleton<WrappedDbUpdateConcurrencyExceptionFactory>();
    services.AddScoped<IJwtTokenService, JwtTokenService>();
}

static void ConfigureApp(WebApplication webApplication, IConfiguration configuration)
{
    webApplication.UseCors("AllowAllOrigins");
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




