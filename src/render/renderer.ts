/**
 * Canvas renderer for 160x100 pixel art scenes
 */

import { SceneCache } from '../ai/cache';
import { SceneDescriptor } from '../map/types';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private scale: number;

  constructor(canvas: HTMLCanvasElement, width: number = 160, height: number = 100, scale: number = 2) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.scale = scale;

    // Set canvas display size (scaled)
    this.canvas.width = width * scale;
    this.canvas.height = height * scale;

    // Set rendering context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;

    // Disable image smoothing for pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  /**
   * Render a scene image
   */
  async renderScene(imageData: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw image scaled up
        this.ctx.drawImage(img, 0, 0, this.width * this.scale, this.height * this.scale);
        resolve();
      };

      img.onerror = () => {
        reject(new Error('Failed to load scene image'));
      };

      img.src = imageData;
    });
  }

  /**
   * Render a loading screen
   */
  renderLoading(message: string = 'Generating scene...'): void {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
  }

  /**
   * Render a placeholder scene (for testing)
   */
  renderPlaceholder(descriptor: SceneDescriptor): void {
    // Clear to black
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw a simple representation
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(20, 20, this.canvas.width - 40, this.canvas.height - 40);

    // Draw position info
    this.ctx.fillStyle = '#0f0';
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'center';

    const { position, facing } = descriptor.viewState;
    this.ctx.fillText(
      `Position: (${position.x}, ${position.y})`,
      this.canvas.width / 2,
      this.canvas.height / 2 - 10
    );
    this.ctx.fillText(
      `Facing: ${facing}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 10
    );

    // Draw entities
    if (descriptor.visibleEntities.length > 0) {
      this.ctx.fillText(
        `Entities: ${descriptor.visibleEntities.length}`,
        this.canvas.width / 2,
        this.canvas.height / 2 + 30
      );
    }
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
