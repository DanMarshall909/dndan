/**
 * Minimap renderer - displays a top-down view of the dungeon
 */

import { World } from '../map/world';
import { Tile } from '../map/types';

export class Minimap {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tileSize: number = 4; // Size of each tile in pixels
  private viewRadius: number = 15; // How many tiles to show in each direction

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context for minimap canvas');
    }
    this.ctx = ctx;
  }

  /**
   * Render the minimap based on current world state
   */
  render(world: World): void {
    const playerPos = world.getPlayerPosition();
    const playerFacing = world.getPlayerFacing();

    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate the center of the canvas
    const centerX = Math.floor(this.canvas.width / 2);
    const centerY = Math.floor(this.canvas.height / 2);

    // Render tiles in a grid around the player
    for (let dy = -this.viewRadius; dy <= this.viewRadius; dy++) {
      for (let dx = -this.viewRadius; dx <= this.viewRadius; dx++) {
        const worldX = playerPos.x + dx;
        const worldY = playerPos.y + dy;
        const tile = world.getTile({ x: worldX, y: worldY });

        if (tile && tile.discovered) {
          // Calculate screen position
          const screenX = centerX + dx * this.tileSize;
          const screenY = centerY + dy * this.tileSize;

          // Draw tile based on type
          this.drawTile(screenX, screenY, tile);
        }
      }
    }

    // Draw entities (monsters, items, etc.)
    const entities = world.getState().entities;
    for (const entity of entities.values()) {
      const dx = entity.position.x - playerPos.x;
      const dy = entity.position.y - playerPos.y;

      // Only draw if within view radius
      if (Math.abs(dx) <= this.viewRadius && Math.abs(dy) <= this.viewRadius) {
        const screenX = centerX + dx * this.tileSize;
        const screenY = centerY + dy * this.tileSize;

        // Draw entity
        this.drawEntity(screenX, screenY, entity.type);
      }
    }

    // Draw player at center with direction indicator
    this.drawPlayer(centerX, centerY, playerFacing);

    // Draw border
    this.ctx.strokeStyle = '#0a0';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw a single tile
   */
  private drawTile(x: number, y: number, tile: Tile): void {
    let color: string;

    switch (tile.type) {
      case 'Wall':
        color = '#444';
        break;
      case 'Floor':
        color = '#111';
        break;
      case 'Door':
      case 'LockedDoor':
        color = '#840';
        break;
      case 'SecretDoor':
        color = '#444'; // Looks like wall until discovered
        break;
      case 'Stairs':
        color = '#08f';
        break;
      case 'Pit':
        color = '#200';
        break;
      case 'Water':
        color = '#036';
        break;
      case 'Chest':
        color = '#fa0';
        break;
      default:
        color = '#222';
    }

    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
  }

  /**
   * Draw an entity marker
   */
  private drawEntity(x: number, y: number, type: string): void {
    let color: string;

    switch (type) {
      case 'Monster':
        color = '#f00';
        break;
      case 'NPC':
        color = '#0ff';
        break;
      case 'Item':
        color = '#ff0';
        break;
      default:
        color = '#fff';
    }

    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
  }

  /**
   * Draw the player marker with direction indicator
   */
  private drawPlayer(x: number, y: number, facing: string): void {
    // Draw player as a green square
    this.ctx.fillStyle = '#0f0';
    this.ctx.fillRect(x, y, this.tileSize, this.tileSize);

    // Draw direction indicator (small triangle)
    this.ctx.fillStyle = '#ff0';
    this.ctx.beginPath();

    const halfSize = this.tileSize / 2;
    const center = this.tileSize / 2;

    switch (facing) {
      case 'North':
        this.ctx.moveTo(x + center, y);
        this.ctx.lineTo(x + this.tileSize, y + halfSize);
        this.ctx.lineTo(x, y + halfSize);
        break;
      case 'East':
        this.ctx.moveTo(x + this.tileSize, y + center);
        this.ctx.lineTo(x + halfSize, y + this.tileSize);
        this.ctx.lineTo(x + halfSize, y);
        break;
      case 'South':
        this.ctx.moveTo(x + center, y + this.tileSize);
        this.ctx.lineTo(x, y + halfSize);
        this.ctx.lineTo(x + this.tileSize, y + halfSize);
        break;
      case 'West':
        this.ctx.moveTo(x, y + center);
        this.ctx.lineTo(x + halfSize, y);
        this.ctx.lineTo(x + halfSize, y + this.tileSize);
        break;
    }

    this.ctx.closePath();
    this.ctx.fill();
  }
}
