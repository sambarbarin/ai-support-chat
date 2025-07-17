# Complete Frontend Dockerfile Solution
# This is a reference implementation for the Frontend service

# Stage 1: Build
FROM node:18 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Install a lightweight web server
RUN npm install -g serve

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the frontend port
EXPOSE 3000

# Set the command to serve the application
CMD ["serve", "-s", "dist", "-l", "3000"]
