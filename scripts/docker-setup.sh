#!/bin/bash
set -e

echo "Starting Ollama container..."
docker compose up -d ollama

echo "Waiting for Ollama to be ready..."
until docker compose exec ollama curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; do
  sleep 2
done

echo "Pulling llama3 model (this may take a while)..."
docker compose exec ollama ollama pull llama3

echo "Starting application..."
docker compose up -d app

echo ""
echo "Setup complete!"
echo "  - Ollama API: http://localhost:11434"
echo "  - Frontend:   http://localhost:3000"
echo "  - API proxy:  http://localhost:3001"
echo ""
echo "View logs with: docker compose logs -f"
