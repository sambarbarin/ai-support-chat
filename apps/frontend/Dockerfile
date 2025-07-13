# Stage 1 : build
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN ls -l node_modules/.bin

RUN ./node_modules/.bin/vite --version

RUN npm run build

# Stage 2 : production
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
