/**
 * Combat system with AD&D THAC0 mechanics
 */

import { Character, Monster, Weapon, SavingThrows } from './types';
import { Dice } from './dice';
import { CharacterBuilder } from './character';

// ============================================================================
// COMBAT RESULTS
// ============================================================================

export interface AttackResult {
  hit: boolean;
  damage: number;
  critical: boolean;
  roll: number;
  targetAC: number;
  thac0: number;
  needRoll: number;
}

export interface SavingThrowResult {
  success: boolean;
  roll: number;
  targetNumber: number;
  saveType: keyof SavingThrows;
}

// ============================================================================
// INITIATIVE
// ============================================================================

export interface CombatantInitiative {
  id: string;
  name: string;
  initiative: number;
  isPlayer: boolean;
}

export class CombatEngine {
  /**
   * Roll initiative for all combatants
   */
  static rollInitiative(
    playerParty: Character[],
    monsters: Monster[]
  ): CombatantInitiative[] {
    const initiatives: CombatantInitiative[] = [];

    // Player party
    for (const character of playerParty) {
      const modifiers = CharacterBuilder.calculateAbilityModifiers(character.abilities);
      const roll = Dice.roll(10) + modifiers.initiativeBonus;
      initiatives.push({
        id: character.id,
        name: character.name,
        initiative: roll,
        isPlayer: true,
      });
    }

    // Monsters
    for (const monster of monsters) {
      const roll = Dice.roll(10);
      initiatives.push({
        id: monster.id,
        name: monster.name,
        initiative: roll,
        isPlayer: false,
      });
    }

    // Sort by initiative (highest first)
    initiatives.sort((a, b) => b.initiative - a.initiative);

    return initiatives;
  }

  // ============================================================================
  // ATTACK ROLLS (THAC0)
  // ============================================================================

  /**
   * Character attacks monster
   */
  static characterAttack(
    character: Character,
    target: Monster,
    weapon: Weapon | null
  ): AttackResult {
    const thac0 = character.combat.thac0;
    const targetAC = target.armorClass;

    // Get STR bonus
    const modifiers = CharacterBuilder.calculateAbilityModifiers(character.abilities);

    // Roll 1d20
    const roll = Dice.roll(20);

    // Critical hit on natural 20
    const critical = roll === 20;

    // Calculate needed roll: THAC0 - AC
    const needRoll = thac0 - targetAC;

    // Determine if hit
    const adjustedRoll = roll + modifiers.hitBonus;
    const hit = critical || adjustedRoll >= needRoll;

    // Calculate damage
    let damage = 0;
    if (hit) {
      const weaponDamage = weapon ? Dice.rollFormula(weapon.damage) : Dice.roll(2); // Fist: 1d2
      damage = Math.max(1, weaponDamage + modifiers.damageBonus);

      // Critical hits do maximum damage + normal roll
      if (critical && weapon) {
        const maxDamage = parseInt(weapon.damage.split('d')[1]);
        damage = maxDamage + weaponDamage + modifiers.damageBonus;
      }
    }

    return {
      hit,
      damage,
      critical,
      roll,
      targetAC,
      thac0,
      needRoll,
    };
  }

  /**
   * Monster attacks character
   */
  static monsterAttack(
    monster: Monster,
    target: Character,
    attackIndex: number = 0
  ): AttackResult {
    const thac0 = monster.thac0;
    const targetAC = target.combat.armorClass;

    const attack = monster.attacks[attackIndex] || monster.attacks[0];

    // Roll 1d20
    const roll = Dice.roll(20);

    // Critical hit on natural 20
    const critical = roll === 20;

    // Calculate needed roll
    const needRoll = thac0 - targetAC;

    // Determine if hit
    const hit = critical || roll >= needRoll;

    // Calculate damage
    let damage = 0;
    if (hit) {
      damage = Dice.rollFormula(attack.damage);

      // Critical hits do maximum damage + normal roll
      if (critical) {
        const maxDamage = parseInt(attack.damage.split('d')[1]);
        damage = maxDamage + Dice.rollFormula(attack.damage);
      }
    }

    return {
      hit,
      damage,
      critical,
      roll,
      targetAC,
      thac0,
      needRoll,
    };
  }

  /**
   * Apply damage to character
   */
  static damageCharacter(character: Character, damage: number): boolean {
    character.combat.hitPoints -= damage;

    if (character.combat.hitPoints <= 0) {
      character.combat.hitPoints = 0;
      return true; // Character is dead/unconscious
    }

    return false;
  }

  /**
   * Apply damage to monster
   */
  static damageMonster(monster: Monster, damage: number): boolean {
    monster.hitPoints -= damage;

    if (monster.hitPoints <= 0) {
      monster.hitPoints = 0;
      return true; // Monster is dead
    }

    return false;
  }

  // ============================================================================
  // SAVING THROWS
  // ============================================================================

  /**
   * Make a saving throw
   */
  static savingThrow(
    character: Character,
    saveType: keyof SavingThrows,
    modifier: number = 0
  ): SavingThrowResult {
    const targetNumber = character.saves[saveType];
    const roll = Dice.roll(20) + modifier;

    return {
      success: roll >= targetNumber,
      roll,
      targetNumber,
      saveType,
    };
  }

  /**
   * Monster saving throw
   */
  static monsterSavingThrow(
    monster: Monster,
    saveType: keyof SavingThrows,
    modifier: number = 0
  ): SavingThrowResult {
    // Simplified monster saves based on HD
    const hdNumber = parseInt(monster.hitDice.split('d')[0]);
    const baseSave = 20 - hdNumber;

    const targetNumber = Math.max(2, baseSave);
    const roll = Dice.roll(20) + modifier;

    return {
      success: roll >= targetNumber,
      roll,
      targetNumber,
      saveType,
    };
  }

  // ============================================================================
  // COMBAT UTILITIES
  // ============================================================================

  /**
   * Check morale for monster
   */
  static checkMorale(monster: Monster): boolean {
    const roll = Dice.roll(20);
    return roll <= monster.morale;
  }

  /**
   * Calculate AC from armor and dexterity
   */
  static calculateAC(
    baseAC: number,
    dexBonus: number,
    hasShield: boolean
  ): number {
    let ac = baseAC + dexBonus;
    if (hasShield) {
      ac -= 1; // Shields improve AC by 1
    }
    return ac;
  }

  /**
   * Get description of attack result
   */
  static describeAttackResult(result: AttackResult, attackerName: string, targetName: string): string {
    if (result.critical) {
      return `${attackerName} scores a CRITICAL HIT on ${targetName} for ${result.damage} damage!`;
    } else if (result.hit) {
      return `${attackerName} hits ${targetName} for ${result.damage} damage! (rolled ${result.roll}, needed ${result.needRoll})`;
    } else {
      return `${attackerName} misses ${targetName}! (rolled ${result.roll}, needed ${result.needRoll})`;
    }
  }

  /**
   * Get description of saving throw result
   */
  static describeSavingThrow(result: SavingThrowResult, name: string): string {
    const saveNames = {
      deathMagic: 'Death Magic',
      wands: 'Wands',
      paralysis: 'Paralysis',
      breathWeapon: 'Breath Weapon',
      spells: 'Spells',
    };

    const saveName = saveNames[result.saveType];

    if (result.success) {
      return `${name} succeeds on ${saveName} save! (rolled ${result.roll}, needed ${result.targetNumber})`;
    } else {
      return `${name} fails ${saveName} save. (rolled ${result.roll}, needed ${result.targetNumber})`;
    }
  }
}
