# Complete LLM Service Dockerfile Solution
# This is a reference implementation for the LLM Service

# Use a Node.js base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the application code
COPY . .

# Expose the LLM service port
EXPOSE 8000

# Set the command to run the application
CMD ["npx", "ts-node", "src/index.ts"]
