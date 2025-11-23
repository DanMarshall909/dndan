/**
 * Dungeon generation using BSP (Binary Space Partitioning)
 */

import { Dice } from '../game/dice';
import { World } from './world';
import { Position, Room, Dungeon, TileType } from './types';
import { Monster } from '../game/types';

class BSPNode {
  x: number;
  y: number;
  width: number;
  height: number;
  left?: BSPNode;
  right?: BSPNode;
  room?: Room;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

export class DungeonGenerator {
  private minRoomSize = 6;
  private maxRoomSize = 12;

  /**
   * Generate a dungeon level
   */
  generateDungeon(width: number, height: number, level: number): Dungeon {
    console.log(`[DungeonGen] Generating level ${level} (${width}x${height})`);

    // Create BSP tree
    const root = new BSPNode(0, 0, width, height);
    this.splitNode(root, 0);

    // Create rooms in leaf nodes
    const rooms: Room[] = [];
    this.createRooms(root, rooms);

    // Connect rooms with corridors
    this.createCorridors(root);

    return {
      width,
      height,
      rooms,
      level,
    };
  }

  /**
   * Split BSP node recursively
   */
  private splitNode(node: BSPNode, depth: number): void {
    // Stop splitting if too small or max depth reached
    if (
      depth > 4 ||
      node.width < this.minRoomSize * 2 ||
      node.height < this.minRoomSize * 2
    ) {
      return;
    }

    // Decide split direction
    const splitHorizontal =
      node.width > node.height
        ? false
        : node.height > node.width
        ? true
        : Dice.roll(2) === 1;

    if (splitHorizontal) {
      // Split horizontally
      const splitY =
        node.y + this.minRoomSize + Dice.roll(node.height - this.minRoomSize * 2);

      node.left = new BSPNode(node.x, node.y, node.width, splitY - node.y);
      node.right = new BSPNode(
        node.x,
        splitY,
        node.width,
        node.y + node.height - splitY
      );
    } else {
      // Split vertically
      const splitX =
        node.x + this.minRoomSize + Dice.roll(node.width - this.minRoomSize * 2);

      node.left = new BSPNode(node.x, node.y, splitX - node.x, node.height);
      node.right = new BSPNode(
        splitX,
        node.y,
        node.x + node.width - splitX,
        node.height
      );
    }

    // Recursively split children
    if (node.left) this.splitNode(node.left, depth + 1);
    if (node.right) this.splitNode(node.right, depth + 1);
  }

  /**
   * Create rooms in leaf nodes
   */
  private createRooms(node: BSPNode, rooms: Room[]): void {
    if (node.left || node.right) {
      // Not a leaf, recurse
      if (node.left) this.createRooms(node.left, rooms);
      if (node.right) this.createRooms(node.right, rooms);
    } else {
      // Leaf node - create a room
      const roomWidth =
        this.minRoomSize + Dice.roll(Math.min(this.maxRoomSize - this.minRoomSize, node.width - 2));
      const roomHeight =
        this.minRoomSize + Dice.roll(Math.min(this.maxRoomSize - this.minRoomSize, node.height - 2));

      const roomX = node.x + Dice.roll(node.width - roomWidth);
      const roomY = node.y + Dice.roll(node.height - roomHeight);

      node.room = {
        id: crypto.randomUUID(),
        x: roomX,
        y: roomY,
        width: roomWidth,
        height: roomHeight,
        type: 'Chamber',
      };

      rooms.push(node.room);
    }
  }

  /**
   * Create corridors connecting rooms
   */
  private createCorridors(node: BSPNode): void {
    if (node.left && node.right) {
      this.createCorridors(node.left);
      this.createCorridors(node.right);

      // Connect the two child sections
      const leftCenter = this.getNodeCenter(node.left);
      const rightCenter = this.getNodeCenter(node.right);

      // Create L-shaped corridor
      if (Dice.roll(2) === 1) {
        // Horizontal then vertical
        this.createHorizontalCorridor(leftCenter.x, rightCenter.x, leftCenter.y);
        this.createVerticalCorridor(leftCenter.y, rightCenter.y, rightCenter.x);
      } else {
        // Vertical then horizontal
        this.createVerticalCorridor(leftCenter.y, rightCenter.y, leftCenter.x);
        this.createHorizontalCorridor(leftCenter.x, rightCenter.x, rightCenter.y);
      }
    }
  }

  /**
   * Get center point of a node (or its room)
   */
  private getNodeCenter(node: BSPNode): Position {
    if (node.room) {
      return {
        x: node.room.x + Math.floor(node.room.width / 2),
        y: node.room.y + Math.floor(node.room.height / 2),
      };
    }

    if (node.left) return this.getNodeCenter(node.left);
    if (node.right) return this.getNodeCenter(node.right);

    return { x: node.x + Math.floor(node.width / 2), y: node.y + Math.floor(node.height / 2) };
  }

  private createHorizontalCorridor(x1: number, x2: number, y: number): void {
    // Stored for later use when applying to world
    // In actual implementation, mark these tiles as corridor
  }

  private createVerticalCorridor(y1: number, y2: number, x: number): void {
    // Stored for later use
  }

  /**
   * Apply dungeon to world state
   */
  applyToWorld(dungeon: Dungeon, world: World): void {
    console.log(`[DungeonGen] Applying ${dungeon.rooms.length} rooms to world`);

    // First, fill everything with walls
    for (let x = 0; x < dungeon.width; x++) {
      for (let y = 0; y < dungeon.height; y++) {
        world.setTile({ x, y }, {
          type: 'Wall',
          blocking: true,
          opaque: true,
          discovered: false,
        });
      }
    }

    // Create rooms
    for (const room of dungeon.rooms) {
      for (let x = room.x; x < room.x + room.width; x++) {
        for (let y = room.y; y < room.y + room.height; y++) {
          // Interior is floor
          if (
            x > room.x &&
            x < room.x + room.width - 1 &&
            y > room.y &&
            y < room.y + room.height - 1
          ) {
            world.setTile({ x, y }, {
              type: 'Floor',
              blocking: false,
              opaque: false,
              discovered: false,
            });
          } else {
            // Edges are walls
            world.setTile({ x, y }, {
              type: 'Wall',
              blocking: true,
              opaque: true,
              discovered: false,
            });
          }
        }
      }

      // Add doors
      this.addDoors(room, world);
    }

    // Add corridors connecting rooms
    this.connectRooms(dungeon.rooms, world);

    // Place starting position in first room
    const startRoom = dungeon.rooms[0];
    const startX = startRoom.x + Math.floor(startRoom.width / 2);
    const startY = startRoom.y + Math.floor(startRoom.height / 2);

    world.getState().player.position = { x: startX, y: startY };
    world.markTileDiscovered({ x: startX, y: startY });
  }

  /**
   * Add doors to rooms
   */
  private addDoors(room: Room, world: World): void {
    // Add 1-2 doors per room
    const doorCount = Dice.roll(2);

    for (let i = 0; i < doorCount; i++) {
      // Pick a random wall
      const side = Dice.roll(4);
      let doorX, doorY;

      switch (side) {
        case 1: // North
          doorX = room.x + Dice.roll(room.width - 2);
          doorY = room.y;
          break;
        case 2: // South
          doorX = room.x + Dice.roll(room.width - 2);
          doorY = room.y + room.height - 1;
          break;
        case 3: // East
          doorX = room.x + room.width - 1;
          doorY = room.y + Dice.roll(room.height - 2);
          break;
        case 4: // West
          doorX = room.x;
          doorY = room.y + Dice.roll(room.height - 2);
          break;
        default:
          continue;
      }

      world.setTile({ x: doorX, y: doorY }, {
        type: 'Door',
        blocking: false,
        opaque: false,
        discovered: false,
      });
    }
  }

  /**
   * Connect rooms with corridors
   */
  private connectRooms(rooms: Room[], world: World): void {
    for (let i = 0; i < rooms.length - 1; i++) {
      const room1 = rooms[i];
      const room2 = rooms[i + 1];

      const x1 = room1.x + Math.floor(room1.width / 2);
      const y1 = room1.y + Math.floor(room1.height / 2);
      const x2 = room2.x + Math.floor(room2.width / 2);
      const y2 = room2.y + Math.floor(room2.height / 2);

      // Create L-shaped corridor
      if (Dice.roll(2) === 1) {
        this.carveCorridor(x1, y1, x2, y1, world);
        this.carveCorridor(x2, y1, x2, y2, world);
      } else {
        this.carveCorridor(x1, y1, x1, y2, world);
        this.carveCorridor(x1, y2, x2, y2, world);
      }
    }
  }

  /**
   * Carve a straight corridor
   */
  private carveCorridor(x1: number, y1: number, x2: number, y2: number, world: World): void {
    const dx = x2 > x1 ? 1 : x2 < x1 ? -1 : 0;
    const dy = y2 > y1 ? 1 : y2 < y1 ? -1 : 0;

    let x = x1;
    let y = y1;

    while (x !== x2 || y !== y2) {
      const tile = world.getTile({ x, y });
      if (tile && tile.type !== 'Floor') {
        world.setTile({ x, y }, {
          type: 'Floor',
          blocking: false,
          opaque: false,
          discovered: false,
        });
      }

      if (x !== x2) x += dx;
      else if (y !== y2) y += dy;
    }
  }
}
