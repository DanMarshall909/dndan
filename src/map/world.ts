/**
 * World state management - tile map and entity system
 */

import { WorldState, Tile, Entity, Position, Direction, ViewState, TileType } from './types';

export class World {
  private state: WorldState;

  constructor() {
    this.state = {
      level: 1,
      tiles: new Map(),
      entities: new Map(),
      player: {
        position: { x: 0, y: 0 },
        facing: 'North',
      },
      time: 0,
      lighting: 'Dim',
    };
  }

  // ============================================================================
  // TILE MANAGEMENT
  // ============================================================================

  getTile(pos: Position): Tile | undefined {
    return this.state.tiles.get(this.positionKey(pos));
  }

  setTile(pos: Position, tile: Tile): void {
    this.state.tiles.set(this.positionKey(pos), tile);
  }

  isTileBlocking(pos: Position): boolean {
    const tile = this.getTile(pos);
    return tile?.blocking ?? true; // Default to blocking if no tile
  }

  isTileOpaque(pos: Position): boolean {
    const tile = this.getTile(pos);
    return tile?.opaque ?? true;
  }

  markTileDiscovered(pos: Position): void {
    const tile = this.getTile(pos);
    if (tile) {
      tile.discovered = true;
    }
  }

  // ============================================================================
  // ENTITY MANAGEMENT
  // ============================================================================

  getEntity(id: string): Entity | undefined {
    return this.state.entities.get(id);
  }

  getEntitiesAt(pos: Position): Entity[] {
    const entities: Entity[] = [];
    for (const entity of this.state.entities.values()) {
      if (entity.position.x === pos.x && entity.position.y === pos.y) {
        entities.push(entity);
      }
    }
    return entities;
  }

  addEntity(entity: Entity): void {
    this.state.entities.set(entity.id, entity);
  }

  removeEntity(id: string): void {
    this.state.entities.delete(id);
  }

  moveEntity(id: string, newPos: Position): boolean {
    const entity = this.getEntity(id);
    if (!entity) return false;

    // Check if destination is valid
    if (this.isTileBlocking(newPos)) {
      return false;
    }

    entity.position = newPos;
    return true;
  }

  // ============================================================================
  // PLAYER MOVEMENT
  // ============================================================================

  getPlayerPosition(): Position {
    return { ...this.state.player.position };
  }

  getPlayerFacing(): Direction {
    return this.state.player.facing;
  }

  getPlayerViewState(): ViewState {
    return {
      position: this.getPlayerPosition(),
      facing: this.getPlayerFacing(),
    };
  }

  movePlayer(direction: Direction): boolean {
    const newPos = this.getPositionInDirection(this.state.player.position, direction);

    // Check for blocking tiles
    if (this.isTileBlocking(newPos)) {
      return false;
    }

    // Check for entities
    const entities = this.getEntitiesAt(newPos);
    const blockingEntity = entities.find((e) => e.type === 'Monster');
    if (blockingEntity) {
      return false; // Initiate combat instead
    }

    this.state.player.position = newPos;
    this.markTileDiscovered(newPos);
    return true;
  }

  rotatePlayer(clockwise: boolean): void {
    const directions: Direction[] = ['North', 'East', 'South', 'West'];
    const currentIndex = directions.indexOf(this.state.player.facing);

    if (clockwise) {
      this.state.player.facing = directions[(currentIndex + 1) % 4];
    } else {
      this.state.player.facing = directions[(currentIndex + 3) % 4];
    }
  }

  // ============================================================================
  // VISION & LINE OF SIGHT
  // ============================================================================

  getVisibleTiles(radius: number = 5): Position[] {
    const visible: Position[] = [];
    const playerPos = this.state.player.position;

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const pos = { x: playerPos.x + dx, y: playerPos.y + dy };

        // Check distance
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > radius) continue;

        // Check line of sight
        if (this.hasLineOfSight(playerPos, pos)) {
          visible.push(pos);
          this.markTileDiscovered(pos);
        }
      }
    }

    return visible;
  }

  hasLineOfSight(from: Position, to: Position): boolean {
    // Bresenham's line algorithm for line of sight
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const sx = from.x < to.x ? 1 : -1;
    const sy = from.y < to.y ? 1 : -1;
    let err = dx - dy;

    let x = from.x;
    let y = from.y;

    while (x !== to.x || y !== to.y) {
      if (this.isTileOpaque({ x, y }) && (x !== from.x || y !== from.y)) {
        return false;
      }

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    return true;
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  private positionKey(pos: Position): string {
    return `${pos.x},${pos.y}`;
  }

  private getPositionInDirection(pos: Position, direction: Direction): Position {
    switch (direction) {
      case 'North':
        return { x: pos.x, y: pos.y - 1 };
      case 'South':
        return { x: pos.x, y: pos.y + 1 };
      case 'East':
        return { x: pos.x + 1, y: pos.y };
      case 'West':
        return { x: pos.x - 1, y: pos.y };
    }
  }

  // ============================================================================
  // STATE ACCESS
  // ============================================================================

  getState(): WorldState {
    return this.state;
  }

  setState(state: WorldState): void {
    this.state = state;
  }

  // ============================================================================
  // TIME & ENVIRONMENT
  // ============================================================================

  advanceTime(minutes: number): void {
    this.state.time += minutes;
  }

  getTimeOfDay(): string {
    const hours = Math.floor(this.state.time / 60) % 24;
    if (hours < 6) return 'Night';
    if (hours < 12) return 'Morning';
    if (hours < 18) return 'Afternoon';
    return 'Evening';
  }
}
