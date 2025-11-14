/**
 * Scene generation using Stable Diffusion
 */

import { SceneDescriptor, Entity, Tile, Position } from '../map/types';
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

export class SceneGenerator {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
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
  private getTilesInView(viewState: any, world: World): Position[] {
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
   * Describe the environment (walls, floors, doors)
   */
  private describeEnvironment(positions: Position[], lighting: string): string {
    // Simplified - in a real implementation, check tile types
    return 'stone dungeon corridor, moss-covered walls, cobblestone floor';
  }

  /**
   * Describe visible entities
   */
  private describeEntities(entities: Entity[], viewState: any): string {
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
  private describeLighting(lighting: string, timeOfDay: string): string {
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
   * Generate scene image via Stable Diffusion API
   */
  async generateScene(descriptor: SceneDescriptor, world: World): Promise<string> {
    const prompt = this.buildPrompt(descriptor, world);
    const negativePrompt = this.buildNegativePrompt();

    const params: SDGenerationParams = {
      prompt,
      negativePrompt,
      width: 160,
      height: 100,
      steps: 25,
      cfgScale: 7.5,
    };

    console.log('[SceneGen] Generating scene:', prompt);

    try {
      const response = await fetch(`${this.apiUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`SD API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Assume API returns base64 encoded image
      return data.image || data.images?.[0];
    } catch (error) {
      console.error('[SceneGen] Generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate a placeholder image (for testing without SD API)
   */
  generatePlaceholder(descriptor: SceneDescriptor): string {
    // Return a simple placeholder as base64 PNG
    // In production, this would be a proper placeholder image
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAABkCAYAAAAdySNgAAAAD0lEQVR42u3BAQ0AAADCoPdPbQ8HFAAAAPwYPwAE1QBCAAAAAElFTkSuQmCC';
  }
}
