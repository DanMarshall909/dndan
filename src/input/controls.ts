/**
 * Input handling for keyboard and mouse controls
 */

import { Direction } from '../map/types';

export type ActionType =
  | 'MoveNorth'
  | 'MoveSouth'
  | 'MoveEast'
  | 'MoveWest'
  | 'RotateLeft'
  | 'RotateRight'
  | 'Interact'
  | 'CharacterSheet'
  | 'Inventory'
  | 'CastSpell'
  | 'Rest'
  | 'Menu';

export interface GameAction {
  type: ActionType;
  timestamp: number;
}

export class InputController {
  private keyHandlers: Map<string, ActionType>;
  private actionQueue: GameAction[];
  private enabled: boolean;

  constructor() {
    this.keyHandlers = new Map();
    this.actionQueue = [];
    this.enabled = true;

    this.setupKeyBindings();
    this.attachEventListeners();
  }

  /**
   * Setup default key bindings
   */
  private setupKeyBindings(): void {
    // Movement
    this.keyHandlers.set('ArrowUp', 'MoveNorth');
    this.keyHandlers.set('w', 'MoveNorth');
    this.keyHandlers.set('W', 'MoveNorth');

    this.keyHandlers.set('ArrowDown', 'MoveSouth');
    this.keyHandlers.set('s', 'MoveSouth');
    this.keyHandlers.set('S', 'MoveSouth');

    this.keyHandlers.set('ArrowLeft', 'MoveWest');
    this.keyHandlers.set('a', 'MoveWest');
    this.keyHandlers.set('A', 'MoveWest');

    this.keyHandlers.set('ArrowRight', 'MoveEast');
    this.keyHandlers.set('d', 'MoveEast');
    this.keyHandlers.set('D', 'MoveEast');

    // Rotation
    this.keyHandlers.set('q', 'RotateLeft');
    this.keyHandlers.set('Q', 'RotateLeft');
    this.keyHandlers.set('e', 'RotateRight');
    this.keyHandlers.set('E', 'RotateRight');

    // Actions
    this.keyHandlers.set(' ', 'Interact');
    this.keyHandlers.set('c', 'CharacterSheet');
    this.keyHandlers.set('C', 'CharacterSheet');
    this.keyHandlers.set('i', 'Inventory');
    this.keyHandlers.set('I', 'Inventory');
    this.keyHandlers.set('m', 'CastSpell');
    this.keyHandlers.set('M', 'CastSpell');
    this.keyHandlers.set('r', 'Rest');
    this.keyHandlers.set('R', 'Rest');
    this.keyHandlers.set('Escape', 'Menu');
  }

  /**
   * Attach keyboard event listeners
   */
  private attachEventListeners(): void {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  /**
   * Handle keydown events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    const action = this.keyHandlers.get(event.key);
    if (action) {
      event.preventDefault();
      this.queueAction(action);
    }
  }

  /**
   * Queue an action
   */
  private queueAction(type: ActionType): void {
    this.actionQueue.push({
      type,
      timestamp: Date.now(),
    });
  }

  /**
   * Get next action from queue
   */
  getNextAction(): GameAction | null {
    return this.actionQueue.shift() || null;
  }

  /**
   * Check if there are pending actions
   */
  hasPendingActions(): boolean {
    return this.actionQueue.length > 0;
  }

  /**
   * Clear action queue
   */
  clearActions(): void {
    this.actionQueue = [];
  }

  /**
   * Enable/disable input
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Convert movement action to direction
   */
  static actionToDirection(action: ActionType): Direction | null {
    switch (action) {
      case 'MoveNorth':
        return 'North';
      case 'MoveSouth':
        return 'South';
      case 'MoveEast':
        return 'East';
      case 'MoveWest':
        return 'West';
      default:
        return null;
    }
  }
}
