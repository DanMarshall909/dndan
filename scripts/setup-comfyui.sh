#!/bin/bash
# Setup script for ComfyUI with Stable Diffusion model

set -e

echo "=== ComfyUI Setup Script ==="
echo ""

# Check if docker-compose is running with comfyui
if ! docker ps --format '{{.Names}}' | grep -q 'dndan-comfyui'; then
    echo "ComfyUI container not running."
    echo "Starting docker-compose with new configuration..."
    echo ""
    docker-compose down 2>/dev/null || true
    docker-compose up -d --build

    echo "Waiting for ComfyUI to be ready..."
    sleep 30
fi

# Wait for container to be healthy
echo "Waiting for ComfyUI container to be ready..."
for i in {1..60}; do
    if docker exec dndan-comfyui curl -s http://localhost:8188/ > /dev/null 2>&1; then
        echo "ComfyUI is ready!"
        break
    fi
    echo -n "."
    sleep 5
done
echo ""

# Check if model already exists
if docker exec dndan-comfyui test -f /opt/ComfyUI/models/checkpoints/v1-5-pruned-emaonly.safetensors 2>/dev/null; then
    echo "✓ Model already downloaded"
else
    echo "Downloading Stable Diffusion 1.5 model (~4GB)..."
    echo "This may take several minutes..."
    echo ""

    docker exec dndan-comfyui wget -q --show-progress \
        -P /opt/ComfyUI/models/checkpoints/ \
        https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors

    echo ""
    echo "✓ Model downloaded successfully"
fi

# Verify model
echo ""
echo "Checking available models..."
docker exec dndan-comfyui ls -lh /opt/ComfyUI/models/checkpoints/

echo ""
echo "=== Setup Complete ==="
echo ""
echo "ComfyUI is available at: http://localhost:8188"
echo "You can now use 'comfyui' as the image provider in the game."
echo ""
echo "To test image generation:"
echo "  npx ts-node scripts/test-comfyui.ts"
