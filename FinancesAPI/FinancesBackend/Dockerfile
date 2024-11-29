# Basis-Image f�r .NET Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

# Build-Image mit .NET SDK
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Korrektur des Pfades zu FinancesBackend.csproj im FinancesAPI-Ordner
COPY ["FinancesAPI/FinancesBackend/FinancesBackend.csproj", "FinancesAPI/FinancesBackend/"]
RUN dotnet restore "FinancesAPI/FinancesBackend.csproj"

# Kopieren des restlichen Codes und Bauen der Anwendung
COPY . .
WORKDIR "/src/FinancesAPI"
RUN dotnet build "FinancesBackend.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Ver�ffentlichungs-Schritt
FROM build AS publish
RUN dotnet publish "FinancesBackend.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Finales Image mit der ver�ffentlichten Anwendung
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FinancesBackend.dll"]
