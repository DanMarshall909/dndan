/**
 * Scene generation using Stable Diffusion
 */

import { SceneDescriptor, Entity, Position } from '../map/types';
import { World } from '../map/world';

export interface SDGenerationParams {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  seed?: number;
}

export type ImageProvider = 'openai' | 'replicate' | 'stability' | 'placeholder';

export interface ImageGenerationConfig {
  provider: ImageProvider;
  apiUrl: string;
  apiKey: string;
}

export class SceneGenerator {
  private config: ImageGenerationConfig;
  private backendUrl: string;

  constructor(config: ImageGenerationConfig, backendUrl: string = 'http://localhost:3001') {
    this.config = config;
    this.backendUrl = backendUrl;
  }

  /**
   * Use Claude to enhance the image generation prompt based on game state and narrative
   */
  async enhancePromptWithAI(descriptor: SceneDescriptor, world: World): Promise<string> {
    const { viewState, visibleEntities, lighting, timeOfDay, narrative, recentEvents } = descriptor;

    // Build context for Claude
    const tilesAhead = this.getTilesInView(viewState, world);
    const envDesc = this.describeEnvironmentDetailed(tilesAhead, world);
    const entityDesc = this.describeEntities(visibleEntities, viewState);

    const contextParts: string[] = [
      `You are creating a prompt for an AI image generator to create a pixel art scene for a D&D roguelike game.`,
      ``,
      `Game State:`,
      `- View: Top-down dungeon view, player facing ${viewState.facing}`,
      `- Lighting: ${lighting}`,
      `- Time: ${timeOfDay}`,
      `- Environment: ${envDesc}`,
    ];

    if (entityDesc) {
      contextParts.push(`- Entities visible: ${entityDesc}`);
    }

    if (narrative) {
      contextParts.push(``, `Current Narrative:`, narrative);
    }

    if (recentEvents && recentEvents.length > 0) {
      contextParts.push(``, `Recent Events:`, ...recentEvents.map(e => `- ${e}`));
    }

    contextParts.push(
      ``,
      `Create a detailed prompt for generating a 160x100 pixel art image in the style of classic SSI Gold Box D&D games (Pool of Radiance, etc.).`,
      `The prompt should describe the scene from a top-down perspective, include visual details about the dungeon layout, lighting, and any visible creatures or objects.`,
      `Use retro gaming terminology and emphasize the pixel art aesthetic with EGA-style 256 colors.`,
      ``,
      `Return ONLY the image generation prompt, nothing else.`
    );

    try {
      const response = await fetch(`${this.backendUrl}/api/claude`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: contextParts.join('\n') }],
          system: 'You are an expert at creating prompts for AI image generation, specializing in retro pixel art game scenes.',
          temperature: 0.7,
          max_tokens: 400,
        }),
      });

      if (!response.ok) {
        console.warn('[SceneGen] Claude enhancement failed, using basic prompt');
        return this.buildPrompt(descriptor, world);
      }

      const data = await response.json();
      const enhancedPrompt = data.narrative || this.buildPrompt(descriptor, world);

      console.log('[SceneGen] Enhanced prompt:', enhancedPrompt);
      return enhancedPrompt;
    } catch (error) {
      console.error('[SceneGen] Prompt enhancement error:', error);
      return this.buildPrompt(descriptor, world);
    }
  }

  /**
   * Build a detailed prompt for scene generation
   */
  buildPrompt(descriptor: SceneDescriptor, world: World): string {
    const { viewState, visibleEntities, lighting, timeOfDay } = descriptor;

    // Get tiles in front of player
    const tilesAhead = this.getTilesInView(viewState, world);

    // Build scene description
    const parts: string[] = [
      '160x100 pixel art',
      '256-color EGA palette',
      'retro RPG style',
      'top-down dungeon view',
    ];

    // Describe environment
    const envDesc = this.describeEnvironment(tilesAhead, lighting);
    if (envDesc) parts.push(envDesc);

    // Describe entities
    const entityDesc = this.describeEntities(visibleEntities, viewState);
    if (entityDesc) parts.push(entityDesc);

    // Lighting and atmosphere
    parts.push(this.describeLighting(lighting, timeOfDay));

    // Style reference
    parts.push('inspired by Pool of Radiance and SSI Gold Box games');
    parts.push('classic D&D video game aesthetic');
    parts.push('crisp pixel art');

    return parts.join(', ');
  }

  /**
   * Get tiles in the player's field of view
   */
  private getTilesInView(viewState: any, _world: World): Position[] {
    // Get tiles in a cone in front of the player
    const positions: Position[] = [];
    const { position, facing } = viewState;

    // Define view distance
    const viewDistance = 5;

    for (let dist = 1; dist <= viewDistance; dist++) {
      for (let side = -2; side <= 2; side++) {
        const pos = this.getRelativePosition(position, facing, dist, side);
        positions.push(pos);
      }
    }

    return positions;
  }

  /**
   * Get position relative to player facing
   */
  private getRelativePosition(
    pos: Position,
    facing: string,
    forward: number,
    side: number
  ): Position {
    switch (facing) {
      case 'North':
        return { x: pos.x + side, y: pos.y - forward };
      case 'South':
        return { x: pos.x - side, y: pos.y + forward };
      case 'East':
        return { x: pos.x + forward, y: pos.y + side };
      case 'West':
        return { x: pos.x - forward, y: pos.y - side };
      default:
        return pos;
    }
  }

  /**
   * Describe the environment (walls, floors, doors) - detailed version for Claude
   */
  private describeEnvironmentDetailed(positions: Position[], world: World): string {
    const tileCounts: Record<string, number> = {};

    for (const pos of positions) {
      const tile = world.getTile(pos);
      if (tile) {
        tileCounts[tile.type] = (tileCounts[tile.type] || 0) + 1;
      }
    }

    const descriptions: string[] = [];

    if (tileCounts['Floor']) {
      descriptions.push('cobblestone floor');
    }
    if (tileCounts['Wall']) {
      descriptions.push('stone walls');
    }
    if (tileCounts['Door']) {
      descriptions.push('wooden doors');
    }
    if (tileCounts['LockedDoor']) {
      descriptions.push('locked doors');
    }
    if (tileCounts['SecretDoor']) {
      descriptions.push('hidden passages');
    }
    if (tileCounts['Water']) {
      descriptions.push('pools of water');
    }
    if (tileCounts['Pit']) {
      descriptions.push('dangerous pits');
    }
    if (tileCounts['Chest']) {
      descriptions.push('treasure chests');
    }
    if (tileCounts['Stairs']) {
      descriptions.push('stairs leading down');
    }

    return descriptions.length > 0 ? descriptions.join(', ') : 'stone dungeon corridor';
  }

  /**
   * Describe the environment (walls, floors, doors)
   */
  private describeEnvironment(_positions: Position[], _lighting: string): string {
    // Simplified - in a real implementation, check tile types
    return 'stone dungeon corridor, moss-covered walls, cobblestone floor';
  }

  /**
   * Describe visible entities
   */
  private describeEntities(entities: Entity[], _viewState: any): string {
    if (entities.length === 0) return '';

    const descriptions: string[] = [];

    for (const entity of entities) {
      switch (entity.type) {
        case 'Monster':
          descriptions.push(`${(entity.data as any).name} ahead`);
          break;
        case 'NPC':
          descriptions.push(`${(entity.data as any).name} standing nearby`);
          break;
        case 'Item':
          descriptions.push(`${(entity.data as any).name} on the ground`);
          break;
      }
    }

    return descriptions.join(', ');
  }

  /**
   * Describe lighting conditions
   */
  private describeLighting(lighting: string, _timeOfDay: string): string {
    const conditions: string[] = [];

    switch (lighting) {
      case 'Bright':
        conditions.push('well-lit', 'bright torchlight');
        break;
      case 'Dim':
        conditions.push('dim lighting', 'flickering torches');
        break;
      case 'Dark':
        conditions.push('dark shadows', 'barely visible');
        break;
    }

    return conditions.join(', ');
  }

  /**
   * Build negative prompt to avoid unwanted elements
   */
  buildNegativePrompt(): string {
    return [
      'blurry',
      'low quality',
      '3d',
      'realistic',
      'photograph',
      'modern',
      'high resolution',
      'smooth gradients',
      'text',
      'watermark',
    ].join(', ');
  }

  /**
   * Generate scene image using configured AI provider
   */
  async generateScene(descriptor: SceneDescriptor, world: World, useAIEnhancement: boolean = true): Promise<string> {
    // Return placeholder if that's the configured provider
    if (this.config.provider === 'placeholder') {
      return this.generatePlaceholder(descriptor);
    }

    // Get the prompt (enhanced or basic)
    const prompt = useAIEnhancement
      ? await this.enhancePromptWithAI(descriptor, world)
      : this.buildPrompt(descriptor, world);

    const negativePrompt = this.buildNegativePrompt();

    console.log('[SceneGen] Generating scene with provider:', this.config.provider);
    console.log('[SceneGen] Prompt:', prompt);

    try {
      // Send to backend which will route to appropriate provider
      const response = await fetch(`${this.backendUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: this.config.provider,
          prompt,
          negativePrompt,
          width: 160,
          height: 100,
          steps: 25,
          cfgScale: 7.5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Image generation API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Return base64 encoded image
      return data.image || data.images?.[0];
    } catch (error) {
      console.error('[SceneGen] Generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate a placeholder image (for testing without SD API)
   */
  generatePlaceholder(_descriptor: SceneDescriptor): string {
    // Return a simple placeholder as base64 PNG
    // In production, this would be a proper placeholder image
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAABkCAYAAAAdySNgAAAAD0lEQVR42u3BAQ0AAADCoPdPbQ8HFAAAAPwYPwAE1QBCAAAAAElFTkSuQmCC';
  }
}
