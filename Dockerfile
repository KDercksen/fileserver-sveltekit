FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine

WORKDIR /app
COPY --from=builder /app .
RUN ls -l .

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build"]
