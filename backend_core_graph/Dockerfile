# 1. Aşama: Derleme (Build)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Proje dosyasını kopyala ve bağımlılıkları indir
COPY *.csproj ./
RUN dotnet restore

# Tüm kodları kopyala ve yayınla (Release)
COPY . ./
RUN dotnet publish -c Release -o out

# 2. Aşama: Çalıştırma (Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# C# API'nin 5000 portunda çalışmasını zorla
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

# Projenin çalıştırılabilir dosyasını tetikle
ENTRYPOINT ["dotnet", "backend_core_graph.dll"]