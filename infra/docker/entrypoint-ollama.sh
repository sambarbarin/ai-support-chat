#!/bin/sh

# Set Ollama to listen on all interfaces
export OLLAMA_HOST=0.0.0.0

# Start Ollama serve in the background
ollama serve &

# Get the process ID of the ollama serve command
PID=$!

# Wait for the Ollama server to be ready
echo "Waiting for Ollama server to be ready..."
while ! curl -s -o /dev/null http://localhost:11434; do
  echo "Ollama server is not ready yet. Retrying in 1 second..."
  sleep 1
done
echo "Ollama server is ready."

# Pull the model
ollama pull mistral

# Wait for the background process to finish, which will keep the container running
wait $PID
