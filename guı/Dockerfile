# Node.js tabanlı hafif bir imaj kullanıyoruz
FROM node:18-alpine
WORKDIR /app

# Paket listesini kopyala ve npm kütüphanelerini kur
COPY package*.json ./
RUN npm install

# Tüm React kodlarını kopyala
COPY . .

# Dışarıya açılacak port (Vite kullanıyorsan 5173, CRA ise 3000 yazabilirsin)
EXPOSE 5137

# Geliştirme sunucusunu başlat (package.json'daki komutuna göre npm run dev de olabilir)
CMD ["npm", "run", "dev"]