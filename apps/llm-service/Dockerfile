# Dockerfile for LLM Service
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose the port the app runs on


CMD ["npx", "ts-node", "src/index.ts"]
