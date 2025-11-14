/**
 * Main entry point for D&D AN
 */

import { GameEngine } from './game/engine';
import { ImageGenerationConfig, ImageProvider } from './ai/scene-gen';

async function main() {
  console.log('[D&D AN] Starting...');

  // Get container and canvas
  const container = document.getElementById('game-container');
  if (!container) {
    throw new Error('Game container not found');
  }

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  canvas.style.cssText = `
    position: absolute;
    top: 10px;
    left: 10px;
  `;
  container.appendChild(canvas);

  // Load image generation config from environment
  const imageProvider = (import.meta.env.VITE_IMAGE_PROVIDER || 'placeholder') as ImageProvider;
  const imageConfig: ImageGenerationConfig = {
    provider: imageProvider,
    apiUrl: import.meta.env.VITE_IMAGE_API_URL || '',
    apiKey: import.meta.env.VITE_IMAGE_API_KEY || '',
  };

  console.log('[D&D AN] Image provider:', imageProvider);

  // Initialize game engine
  try {
    const game = new GameEngine(
      canvas,
      'game-container',
      imageConfig
    );

    // Show loading message
    const loading = container.querySelector('.loading');
    if (loading) {
      (loading as HTMLElement).textContent = 'Initializing game...';
    }

    // Initialize game
    await game.initializeGame();

    // Remove loading message
    if (loading) {
      loading.remove();
    }

    console.log('[D&D AN] Game initialized successfully');
  } catch (error) {
    console.error('[D&D AN] Initialization failed:', error);

    const loading = container.querySelector('.loading');
    if (loading) {
      (loading as HTMLElement).innerHTML = `
        <div style="color: #f00;">
          Failed to initialize game.<br>
          <small>${error}</small><br><br>
          Check console for details.
        </div>
      `;
    }
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
