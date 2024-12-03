FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source

# copy csproj and restore as distinct layers
COPY *.sln .
COPY FinancesBackend/*.csproj ./FinancesBackend/
RUN dotnet restore

# copy everything else and build app
COPY /FinancesBackend/. ./FinancesBackend/
WORKDIR /source/FinancesBackend
RUN dotnet publish -c release -o /app

# final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app ./

ENTRYPOINT ["dotnet", "FinancesBackend.dll"]
