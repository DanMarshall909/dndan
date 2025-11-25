/**
 * AI-generated 8x8 sprite generation for minimap
 * Uses ComfyUI or other provider to generate tiny pixel art sprites
 */

import { ImageProvider } from './scene-gen';

export interface SpriteGenerationParams {
  entityType: 'player' | 'monster' | 'npc' | 'item' | 'door' | 'chest';
  name?: string;
  description?: string;
}

export interface SpriteCache {
  [key: string]: string; // base64 image data
}

export class SpriteGenerator {
  private provider: ImageProvider;
  private backendUrl: string;
  private cache: SpriteCache;

  constructor(provider: ImageProvider, backendUrl: string = 'http://localhost:3001') {
    this.provider = provider;
    this.backendUrl = backendUrl;
    this.cache = this.initializeDefaultSprites();
  }

  /**
   * Initialize default placeholder sprites
   */
  private initializeDefaultSprites(): SpriteCache {
    return {
      'player': this.createPlaceholderSprite('#0f0'), // Green
      'monster': this.createPlaceholderSprite('#f00'), // Red
      'npc': this.createPlaceholderSprite('#ff0'), // Yellow
      'item': this.createPlaceholderSprite('#0ff'), // Cyan
      'door': this.createPlaceholderSprite('#a52a2a'), // Brown
      'chest': this.createPlaceholderSprite('#ffd700'), // Gold
    };
  }

  /**
   * Create a simple colored square sprite as placeholder
   */
  private createPlaceholderSprite(color: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = color;
    ctx.fillRect(1, 1, 6, 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 8, 1);
    ctx.fillRect(0, 7, 8, 1);
    ctx.fillRect(0, 0, 1, 8);
    ctx.fillRect(7, 0, 1, 8);

    return canvas.toDataURL();
  }

  /**
   * Build prompt for sprite generation
   */
  private buildSpritePrompt(params: SpriteGenerationParams): string {
    const { entityType, name, description } = params;

    const basePrompts: Record<string, string> = {
      player: 'heroic adventurer from above, helmet and shield visible',
      monster: 'dangerous monster creature from top-down view',
      npc: 'friendly townsperson or character from above',
      item: 'magical item or treasure glowing',
      door: 'wooden dungeon door with iron fittings',
      chest: 'treasure chest with lock and metal bands'
    };

    const parts = [
      '8x8 pixel sprite',
      'top-down view',
      'VGA 256 color palette',
      'SSI Gold Box game style',
      description || basePrompts[entityType],
    ];

    if (name) {
      parts.push(`representing ${name}`);
    }

    parts.push('crisp pixel art');
    parts.push('clear silhouette');
    parts.push('distinct colors');

    return parts.join(', ');
  }

  /**
   * Generate or retrieve a sprite
   */
  async getSprite(params: SpriteGenerationParams): Promise<string> {
    const cacheKey = params.name || params.entityType;

    // Return cached sprite if available
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    // Use placeholder for now
    // TODO: Implement actual AI generation when enabled
    if (this.provider === 'placeholder') {
      return this.cache[params.entityType] || this.createPlaceholderSprite('#fff');
    }

    // Generate new sprite
    try {
      const prompt = this.buildSpritePrompt(params);
      const negativePrompt = 'blurry, 3d, realistic, text, watermark';

      const response = await fetch(`${this.backendUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: this.provider,
          prompt,
          negativePrompt,
          width: 8,
          height: 8,
          steps: 20,
          cfgScale: 7.5,
        }),
      });

      if (!response.ok) {
        console.warn('[SpriteGen] Failed to generate sprite, using placeholder');
        return this.cache[params.entityType] || this.createPlaceholderSprite('#fff');
      }

      const data = await response.json();
      const sprite = data.image || data.images?.[0];

      // Cache the generated sprite
      this.cache[cacheKey] = sprite;

      return sprite;
    } catch (error) {
      console.error('[SpriteGen] Error generating sprite:', error);
      return this.cache[params.entityType] || this.createPlaceholderSprite('#fff');
    }
  }

  /**
   * Preload common sprites
   */
  async preloadCommonSprites(): Promise<void> {
    const commonSprites: SpriteGenerationParams[] = [
      { entityType: 'player' },
      { entityType: 'monster', name: 'Goblin' },
      { entityType: 'monster', name: 'Orc' },
      { entityType: 'monster', name: 'Skeleton' },
      { entityType: 'npc', name: 'Merchant' },
      { entityType: 'npc', name: 'Guard' },
      { entityType: 'item' },
      { entityType: 'door' },
      { entityType: 'chest' },
    ];

    // Generate in parallel
    await Promise.all(
      commonSprites.map(params => this.getSprite(params))
    );

    console.log('[SpriteGen] Preloaded', Object.keys(this.cache).length, 'sprites');
  }

  /**
   * Clear sprite cache
   */
  clearCache(): void {
    this.cache = this.initializeDefaultSprites();
  }
}
