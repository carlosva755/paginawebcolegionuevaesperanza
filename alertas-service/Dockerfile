# ==============================================================================
# Multi-stage Dockerfile for alertas-service (C# .NET 8 Web API)
# ==============================================================================

# Stage 1: Build and publish .NET release binaries
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project manifest and restore NuGet packages (layer caching)
COPY AlertasService.csproj ./
RUN dotnet restore AlertasService.csproj

# Copy remaining source files
COPY . .

# Compile in Release mode and publish optimized binaries
RUN dotnet publish AlertasService.csproj -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Minimal runtime image (.NET ASP.NET Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Run as non-root user to mitigate container security risks
USER $APP_UID

# Copy published artifacts from build stage
COPY --from=build /app/publish .

# Expose default .NET 8 container port
EXPOSE 8080

# Microservice entrypoint
ENTRYPOINT ["dotnet", "AlertasService.dll"]
