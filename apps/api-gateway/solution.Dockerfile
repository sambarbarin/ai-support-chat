# Complete API Gateway Dockerfile Solution
# This is a reference implementation for the API Gateway service

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files and build the application
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Expose the API Gateway port
EXPOSE 3001

# Set the command to run the application
CMD ["node", "dist/index.js"]
