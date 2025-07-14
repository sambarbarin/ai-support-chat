# AI Support SaaS

A full-stack LLM-powered customer support platform built with:
- React (chat widget + agent dashboard)
- Express (API gateway)
- FastAPI (LLM interface)
- Microservices via Docker

This project is fully containerized, allowing for a consistent and easy setup process across different operating systems.

## Prerequisites

Before you begin, ensure you have the following tools installed on your system.

- **Git:** A version control system for cloning the repository.
  - [Download Git](https://git-scm.com/downloads)
- **Docker Desktop:** A tool for running applications in isolated containers.
  - [Download for Windows](https://docs.docker.com/desktop/install/windows-install/)
  - [Download for macOS](https://docs.docker.com/desktop/install/mac-install/)
  - [Download for Linux](https://docs.docker.com/desktop/install/linux-install/)

## Getting Started

Follow these steps to get the application up and running.

### 1. Clone the Repository

First, clone the project repository to your local machine using Git.

```bash
git clone https://github.com/sambarbarin/ai-support-chat.git
cd ai-support-chat
```

### 2. Launch the Application

The entire application stack is managed by Docker Compose. Make sure Docker Desktop is running, and then execute the following command from the `infra/docker` directory:

```bash
cd infra/docker
docker-compose up --build
```

This command will:
- Build the Docker images for each service (`frontend`, `api-gateway`, `llm-service`, `ollama`).
- Start all the services in their respective containers.
- Download the `mistral` model for the `ollama` service (this may take some time on the first launch).

**Note:** You do not need to run `npm install` or `npm run build` on your local machine. These steps are automatically executed inside the Docker containers as part of the build process defined in the `Dockerfile` for each service.

### 3. Access the Application

Once all the services are running, you can access the frontend of the application by opening your web browser and navigating to:

[http://localhost:3000](http://localhost:3000)

## Services

The `docker-compose.yml` file defines the following services:

| Service       | Port      | Description                                      |
|---------------|-----------|--------------------------------------------------|
| `frontend`    | `3000`    | The React-based user interface.                  |
| `api-gateway` | `3001`    | The Express server that routes API requests.     |
| `llm-service` | `8000`    | The FastAPI service that interfaces with Ollama. |
| `ollama`      | `11434`   | The Ollama service for running the LLM.          |

## Stopping the Application

To stop all the running services, press `Ctrl + C` in the terminal where `docker-compose` is running, and then run the following command to remove the containers:

```bash
docker-compose down
