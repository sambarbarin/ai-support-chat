#!/bin/sh
# Complete Ollama Entrypoint Script Solution
# This is a reference implementation for the Ollama service

# Set Ollama to listen on all interfaces
export OLLAMA_HOST=0.0.0.0

# Start Ollama serve in the background
echo "Starting Ollama server..."
ollama serve &

# Get the process ID of the ollama serve command
PID=$!

# Wait for the Ollama server to be ready
echo "Waiting for Ollama server to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

while ! curl -s -o /dev/null http://localhost:11434; do
  RETRY_COUNT=$((RETRY_COUNT+1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "Ollama server failed to start after $MAX_RETRIES attempts. Exiting."
    exit 1
  fi
  echo "Ollama server is not ready yet. Retrying in 2 seconds... (Attempt $RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

echo "Ollama server is ready."

# Pull the model
echo "Pulling the mistral model..."
ollama pull mistral

# Check if the model was pulled successfully
if [ $? -ne 0 ]; then
  echo "Failed to pull the mistral model. Exiting."
  exit 1
fi

echo "Model pulled successfully."

# Keep the container running by waiting for the background process
echo "Ollama service is now running."
wait $PID
