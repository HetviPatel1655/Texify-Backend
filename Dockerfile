FROM node:24-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate && npm run build

FROM node:24-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 5000

CMD ["node", "dist/server.js"]
