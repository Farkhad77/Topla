# ============================================================
# Arenio frontend — Vite build + nginx (statik + API proxy)
# Context: topla-web/ qovluğu
# ============================================================
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# VITE_API_BASE_URL boş qalır → nisbi /api (nginx proxy edir).
# Repo-dakı .env dev üçündür; prod build-də proxy dəyişənləri istifadə olunmur.
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
# nginx konfiqi compose-da deploy/nginx.conf-dan mount olunur
EXPOSE 80
