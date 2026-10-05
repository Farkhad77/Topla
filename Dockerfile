# ============================================================
# Arenio API — multi-stage build (.NET 8)
# Context: repo kökü (docker compose bunu özü verir)
# ============================================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Əvvəl yalnız csproj-lar — restore layer-i cache-lənsin
COPY src/Core/Arenio.Domain/Arenio.Domain.csproj src/Core/Arenio.Domain/
COPY src/Core/Arenio.Application/Arenio.Application.csproj src/Core/Arenio.Application/
COPY src/Infrastructure/Arenio.Infrastructure/Arenio.Infrastructure.csproj src/Infrastructure/Arenio.Infrastructure/
COPY src/Infrastructure/Arenio.Persistence/Arenio.Persistence.csproj src/Infrastructure/Arenio.Persistence/
COPY src/Presentation/Arenio.WebAPI/Arenio.WebAPI.csproj src/Presentation/Arenio.WebAPI/
RUN dotnet restore src/Presentation/Arenio.WebAPI/Arenio.WebAPI.csproj

COPY src/ src/
RUN dotnet publish src/Presentation/Arenio.WebAPI/Arenio.WebAPI.csproj \
    -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Bakı vaxtı çevrilmələri üçün tam tzdata (Asia/Baku) — aspnet image-də var,
# amma invariant mode qəti söndürülür ki, TimeZoneInfo işləsin.
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

COPY --from=build /app/publish .

# Şəkillər /app/Storage-a yazılır — compose-da volume ilə qalıcı edilir
RUN mkdir -p /app/Storage/Stadiums

EXPOSE 5077
ENV ASPNETCORE_URLS=http://+:5077
ENTRYPOINT ["dotnet", "Arenio.WebAPI.dll"]
