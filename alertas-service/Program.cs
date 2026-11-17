using System.Text;
using AlertasService.Data;
using AlertasService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. PostgreSQL Database Configuration with Entity Framework Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=postgres;Port=5432;Database=alertas_db;Username=postgres;Password=postgres_secure_pass_2026;";

builder.Services.AddDbContext<AlertasDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Domain Services Dependency Injection
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRiskCalculationService, RiskCalculationService>();

// 3. JWT Bearer Authentication Configuration
var jwtKey = builder.Configuration["Jwt:Key"] ?? "ClaveSecretaSuperSeguraParaJWTEnNuevaEsperanzaSoacha2026Minimo32Caracteres!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "NuevaEsperanzaAuthServer";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "NuevaEsperanzaPlatform";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Enabled for local Docker environment
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 4. CORS Policy Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 5. Controllers and JSON Serialization Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// 6. OpenAPI / Swagger Documentation with JWT Bearer Security Scheme
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Early Warning and Risk API - IED Nueva Esperanza",
        Version = "v1",
        Description = "Microservice for student registry, attendance tracking, surveys, and dropout risk calculation."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
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
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 7. Automated Migration and Database Seeding upon Docker Startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AlertasDbContext>();
        // Automated retry loop to wait for PostgreSQL availability
        int retries = 10;
        while (retries > 0)
        {
            try
            {
                await DbInitializer.SeedAsync(context);
                app.Logger.LogInformation("Alerts database successfully initialized and seeded.");
                break;
            }
            catch (Exception ex)
            {
                retries--;
                app.Logger.LogWarning(ex, "Waiting for PostgreSQL availability... retries remaining: {Retries}", retries);
                await Task.Delay(3000);
                if (retries == 0) throw;
            }
        }
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "An error occurred while initializing the database.");
    }
}

// 8. HTTP Middleware Pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Alertas API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("CorsPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
