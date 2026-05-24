/**
 * Turn-based combat manager
 */

import { Character, Monster } from './types';
import { CombatEngine, CombatantInitiative } from './combat';

export enum TurnPhase {
  PlayerTurn,
  EnemyTurn,
  RoundEnd,
}

export interface CombatState {
  round: number;
  turnIndex: number;
  initiative: CombatantInitiative[];
  currentCombatant: CombatantInitiative | null;
  phase: TurnPhase;
  isActive: boolean;
}

export type PlayerAction = 'attack' | 'defend' | 'flee' | 'item' | 'spell';

export interface TurnResult {
  message: string;
  color: string;
  combatEnded: boolean;
  victory?: boolean;
  fled?: boolean;
}

export class TurnManager {
  private state: CombatState;
  private playerParty: Character[];
  private monsters: Monster[];
  private defendingCharacters: Set<string>;

  constructor(playerParty: Character[], monsters: Monster[]) {
    this.playerParty = playerParty;
    this.monsters = monsters;
    this.defendingCharacters = new Set();

    // Roll initiative
    const initiative = CombatEngine.rollInitiative(playerParty, monsters);

    this.state = {
      round: 1,
      turnIndex: 0,
      initiative,
      currentCombatant: initiative[0] || null,
      phase: initiative[0]?.isPlayer ? TurnPhase.PlayerTurn : TurnPhase.EnemyTurn,
      isActive: true,
    };
  }

  /**
   * Get current combat state
   */
  getState(): CombatState {
    return { ...this.state };
  }

  /**
   * Get current combatant
   */
  getCurrentCombatant(): CombatantInitiative | null {
    return this.state.currentCombatant;
  }

  /**
   * Check if combat is still active
   */
  isActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Get alive monsters
   */
  getAliveMonsters(): Monster[] {
    return this.monsters.filter((m) => m.hitPoints > 0);
  }

  /**
   * Get alive party members
   */
  getAliveParty(): Character[] {
    return this.playerParty.filter((c) => c.combat.hitPoints > 0);
  }

  /**
   * Process player action
   */
  processPlayerAction(action: PlayerAction, targetId?: string): TurnResult {
    if (!this.state.currentCombatant || !this.state.currentCombatant.isPlayer) {
      return {
        message: 'Not player turn!',
        color: '#f00',
        combatEnded: false,
      };
    }

    const character = this.playerParty.find((c) => c.id === this.state.currentCombatant!.id);
    if (!character) {
      return {
        message: 'Character not found!',
        color: '#f00',
        combatEnded: false,
      };
    }

    let result: TurnResult = {
      message: '',
      color: '#fff',
      combatEnded: false,
    };

    switch (action) {
      case 'attack':
        result = this.performAttack(character, targetId);
        break;
      case 'defend':
        result = this.performDefend(character);
        break;
      case 'flee':
        result = this.attemptFlee(character);
        break;
      case 'item':
        result = {
          message: 'Items not yet implemented.',
          color: '#f80',
          combatEnded: false,
        };
        break;
      case 'spell':
        result = {
          message: 'Spells not yet implemented.',
          color: '#f80',
          combatEnded: false,
        };
        break;
    }

    // Advance turn if action completed and combat didn't end
    // Failed flee attempts still consume the turn
    if (!result.combatEnded) {
      this.advanceTurn();
    }

    return result;
  }

  /**
   * Process enemy turn
   */
  processEnemyTurn(): TurnResult {
    if (!this.state.currentCombatant || this.state.currentCombatant.isPlayer) {
      return {
        message: 'Not enemy turn!',
        color: '#f00',
        combatEnded: false,
      };
    }

    const monster = this.monsters.find((m) => m.id === this.state.currentCombatant!.id);
    if (!monster || monster.hitPoints <= 0) {
      // Skip dead monster
      this.advanceTurn();
      return {
        message: '',
        color: '#888',
        combatEnded: false,
      };
    }

    // Simple AI: attack random alive party member
    const aliveParty = this.getAliveParty();
    if (aliveParty.length === 0) {
      return {
        message: 'Party defeated!',
        color: '#f00',
        combatEnded: true,
        victory: false,
      };
    }

    const target = aliveParty[Math.floor(Math.random() * aliveParty.length)];
    const attackResult = CombatEngine.monsterAttack(monster, target);
    const desc = CombatEngine.describeAttackResult(attackResult, monster.name, target.name);

    let message = desc;
    let color = attackResult.hit ? '#f00' : '#888';
    let combatEnded = false;

    if (attackResult.hit) {
      const dead = CombatEngine.damageCharacter(target, attackResult.damage);
      if (dead) {
        message += `\n${target.name} has fallen!`;
        color = '#f00';

        // Check if all party members are dead
        if (this.getAliveParty().length === 0) {
          combatEnded = true;
        }
      }
    }

    // Advance turn
    this.advanceTurn();

    return {
      message,
      color,
      combatEnded,
      victory: false,
    };
  }

  /**
   * Perform attack action
   */
  private performAttack(character: Character, targetId?: string): TurnResult {
    const aliveMonsters = this.getAliveMonsters();
    if (aliveMonsters.length === 0) {
      return {
        message: 'No enemies to attack!',
        color: '#f00',
        combatEnded: true,
        victory: true,
      };
    }

    // Select target (first alive monster if not specified)
    let target: Monster | undefined;
    if (targetId) {
      target = aliveMonsters.find((m) => m.id === targetId);
    }
    if (!target) {
      target = aliveMonsters[0];
    }

    const attackResult = CombatEngine.characterAttack(
      character,
      target,
      character.equipment.weapon
    );
    const desc = CombatEngine.describeAttackResult(attackResult, character.name, target.name);

    let message = desc;
    let color = attackResult.hit ? '#0f0' : '#888';
    let combatEnded = false;
    let victory = false;

    if (attackResult.hit) {
      const dead = CombatEngine.damageMonster(target, attackResult.damage);
      if (dead) {
        message += `\n${target.name} is slain!`;
        character.experience += target.xpValue;

        // Check if all monsters are dead
        if (this.getAliveMonsters().length === 0) {
          message += '\n--- VICTORY! ---';
          color = '#ff0';
          combatEnded = true;
          victory = true;
        }
      }
    }

    return {
      message,
      color,
      combatEnded,
      victory,
    };
  }

  /**
   * Perform defend action (gain AC bonus until next turn)
   */
  private performDefend(character: Character): TurnResult {
    this.defendingCharacters.add(character.id);
    character.combat.armorClass -= 4; // Temporary AC bonus

    return {
      message: `${character.name} takes a defensive stance! (AC bonus: -4)`,
      color: '#0ff',
      combatEnded: false,
    };
  }

  /**
   * Attempt to flee combat
   */
  private attemptFlee(character: Character): TurnResult {
    const roll = Math.random();
    const success = roll < 0.5; // 50% chance

    if (success) {
      return {
        message: `${character.name} successfully flees from combat!`,
        color: '#ff0',
        combatEnded: true,
        fled: true,
      };
    } else {
      return {
        message: `${character.name} fails to escape!`,
        color: '#f80',
        combatEnded: false,
      };
    }
  }

  /**
   * Advance to next turn
   */
  private advanceTurn(): void {
    // Move to next combatant
    this.state.turnIndex++;

    // Check if round is complete
    if (this.state.turnIndex >= this.state.initiative.length) {
      this.startNewRound();
      return;
    }

    // Update current combatant
    this.state.currentCombatant = this.state.initiative[this.state.turnIndex];
    this.state.phase = this.state.currentCombatant.isPlayer
      ? TurnPhase.PlayerTurn
      : TurnPhase.EnemyTurn;
  }

  /**
   * Start a new round
   */
  private startNewRound(): void {
    // Remove defend bonuses at the start of a new round
    for (const charId of this.defendingCharacters) {
      const character = this.playerParty.find((c) => c.id === charId);
      if (character) {
        character.combat.armorClass += 4; // Remove AC bonus
      }
    }
    this.defendingCharacters.clear();

    this.state.round++;
    this.state.turnIndex = 0;
    this.state.currentCombatant = this.state.initiative[0];
    this.state.phase = this.state.currentCombatant?.isPlayer
      ? TurnPhase.PlayerTurn
      : TurnPhase.EnemyTurn;
  }

  /**
   * End combat
   */
  endCombat(): void {
    this.state.isActive = false;

    // Remove all defend bonuses
    for (const charId of this.defendingCharacters) {
      const character = this.playerParty.find((c) => c.id === charId);
      if (character) {
        character.combat.armorClass += 4;
      }
    }
    this.defendingCharacters.clear();
  }

  /**
   * Get initiative order as string
   */
  getInitiativeString(): string {
    return this.state.initiative.map((i) => `${i.name}(${i.initiative})`).join(', ');
  }
}
