# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# Stage 2: Production server
FROM nginx:1.25-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
