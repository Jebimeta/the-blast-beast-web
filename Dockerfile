# ---- Build ----
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime ----
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app
COPY --from=build /app/dist/the-blast-beast-web ./

USER node
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:4000/ > /dev/null || exit 1

CMD ["node", "server/server.mjs"]
