# DevOps Challenge: AI Support Chat Application

Welcome to the DevOps challenge! This repository contains a full-stack AI-powered customer support platform that you'll need to containerize and deploy using Docker and GitLab CI/CD.

## Project Overview

The application consists of several microservices:
- **Frontend**: React-based user interface
- **API Gateway**: Express server that handles API requests
- **LLM Service**: Service that interfaces with the LLM model
- **Ollama**: Service for running the LLM model
- **PostgreSQL**: Database for storing conversations and messages

## Challenge Requirements

Your task is to complete the containerization of this application and set up a CI/CD pipeline for deployment. We've already completed some parts for you to make the challenge more focused.

## Step-by-Step Instructions

### Step 1: Understanding the Project Structure

First, familiarize yourself with the project structure:

```
.
├── apps
│   ├── api-gateway        # Express API server
│   ├── frontend           # React frontend application
│   └── llm-service        # Service for LLM integration
├── infra
│   └── docker             # Docker configuration files
└── packages               # Shared packages
```

Take some time to review the code in each service to understand how they interact with each other.

### Step 2: Complete the Docker Configuration

We've already completed most of the Dockerfiles for you. You only need to:

1. **Complete the LLM Service Dockerfile (apps/llm-service/Dockerfile)**
   - Set up the Node.js environment
   - Install dependencies
   - Configure the correct port exposure
   - Set up the command to run the TypeScript application

2. **Complete the Ollama entrypoint script (infra/docker/entrypoint-ollama.sh)**
   - Configure Ollama to listen on all interfaces
   - Start the Ollama server
   - Pull the required model (mistral)
   - Keep the container running

### Step 3: Complete the Docker Compose Configuration

The `infra/docker/docker-compose.yml` file is partially complete. You need to:

1. Configure the PostgreSQL service:
   - Set up port mapping (5432:5432)
   - Configure environment variables using the .env file
   - Set up volume for data persistence

2. Configure the remaining services:
   - Set up port mappings
   - Configure service dependencies
   - Set up environment variables

3. Define volumes for data persistence:
   - PostgreSQL data
   - Ollama models

### Step 4: Set Up the GitLab CI/CD Pipeline

Create a simple GitLab CI/CD pipeline in the `.gitlab-ci.yml` file that:

1. **Builds the Docker images**:
   - Use Docker-in-Docker
   - Push images to the GitLab Container Registry

2. **Deploys the application**:
   - Deploy to a single environment
   - Use Docker Compose for deployment

### Step 5: Test Your Solution

Test your solution to ensure:
1. All services can be built and run locally using Docker Compose
2. The GitLab CI/CD pipeline successfully builds and deploys the application

## Environment Setup

You don't need to fork or clone this repository. Instead:

1. **Access the GitLab Project**: You will be given access to a GitLab project with this code
2. **Create a Branch**: Create a new branch for your work
3. **Make Changes**: Make your changes directly in the GitLab web interface or clone the repository locally
4. **Push Changes**: Push your changes to trigger the CI/CD pipeline

## Environment Variables

The application requires several environment variables to be configured:

1. Copy the example environment file:
   ```
   cp .env.example .env
   ```

2. Update the variables in the `.env` file with appropriate values:
   ```
   # Database Configuration
   POSTGRES_USER=your_postgres_user
   POSTGRES_PASSWORD=your_secure_password
   POSTGRES_DB=your_database_name
   DB_HOST=postgres
   DB_PORT=5432
   DB_NAME=your_database_name
   DB_USER=your_postgres_user
   DB_PASSWORD=your_secure_password
   ```

3. Ensure these variables are properly used in your Docker Compose and GitLab CI/CD configurations

## Evaluation Criteria

Your solution will be evaluated based on:

- **Functionality**: Does everything work as expected?
- **Best Practices**: Are you following Docker and CI/CD best practices?
- **Security**: Have you considered security aspects?
- **Optimization**: Have you optimized for performance and resource usage?

## Hints

- Start by understanding how the services interact with each other
- Use Docker Compose for local development and testing
- Consider using environment variables for configuration
- Think about how to optimize the Docker images for production

Good luck!
