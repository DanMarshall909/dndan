/**
 * Map and world state types
 */

import { Monster, Item } from '../game/types';

// ============================================================================
// DIRECTIONS & POSITION
// ============================================================================

export type Direction = 'North' | 'East' | 'South' | 'West';

export interface Position {
  x: number;
  y: number;
}

export interface ViewState {
  position: Position;
  facing: Direction;
}

// ============================================================================
// TILES
// ============================================================================

export type TileType =
  | 'Floor'
  | 'Wall'
  | 'Door'
  | 'LockedDoor'
  | 'SecretDoor'
  | 'Stairs'
  | 'Pit'
  | 'Water'
  | 'Chest';

export interface Tile {
  type: TileType;
  blocking: boolean;      // Blocks movement
  opaque: boolean;        // Blocks line of sight
  discovered: boolean;    // Has been seen by player
  description?: string;   // AI-generated description
}

// ============================================================================
// ENTITIES
// ============================================================================

export type EntityType = 'Monster' | 'NPC' | 'Item';

export interface Entity {
  id: string;
  type: EntityType;
  position: Position;
  data: Monster | NPC | Item;
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  dialogue: string[];     // AI-generated dialogue
  hostile: boolean;
  questGiver: boolean;
}

// ============================================================================
// WORLD STATE
// ============================================================================

export interface WorldState {
  level: number;
  tiles: Map<string, Tile>;     // Key: "x,y"
  entities: Map<string, Entity>; // Key: entity ID
  player: ViewState;
  time: number;                  // In-game time (minutes)
  lighting: LightingCondition;
}

export type LightingCondition = 'Bright' | 'Dim' | 'Dark';

// ============================================================================
// SCENE GENERATION
// ============================================================================

export interface SceneDescriptor {
  viewState: ViewState;
  visibleTiles: Tile[];
  visibleEntities: Entity[];
  lighting: LightingCondition;
  timeOfDay: string;
  narrative?: string;  // Current narrative context from DM
  recentEvents?: string[];  // Recent game events for context
}

export interface SceneCache {
  hash: string;
  imageData: string;      // Base64 or file path
  timestamp: number;
}

// ============================================================================
// DUNGEON GENERATION
// ============================================================================

export interface Room {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: RoomType;
  description?: string;
}

export type RoomType =
  | 'Chamber'
  | 'Corridor'
  | 'TreasureRoom'
  | 'BossRoom'
  | 'StartRoom';

export interface Dungeon {
  width: number;
  height: number;
  rooms: Room[];
  level: number;
}
