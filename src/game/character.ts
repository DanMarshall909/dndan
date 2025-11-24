/**
 * Character creation and management (AD&D 1st/2nd Edition)
 */

import { Character, AbilityScores, CharacterClass, Race, Alignment, ClassInfo, RaceInfo, SavingThrows } from './types';
import { Dice } from './dice';

// ============================================================================
// RACE DATA
// ============================================================================

export const RACES: Record<Race, RaceInfo> = {
  Human: {
    name: 'Human',
    abilityAdjustments: {},
    allowedClasses: ['Fighter', 'Ranger', 'Paladin', 'Cleric', 'Magic-User', 'Thief'],
    infravision: 0,
    specialAbilities: ['Can dual-class'],
  },
  Elf: {
    name: 'Elf',
    abilityAdjustments: { dexterity: 1, constitution: -1 },
    allowedClasses: ['Fighter', 'Ranger', 'Magic-User', 'Thief'],
    infravision: 60,
    specialAbilities: ['Resistance to sleep and charm', '90% resistance to sleep/charm spells'],
  },
  Dwarf: {
    name: 'Dwarf',
    abilityAdjustments: { constitution: 1, charisma: -1 },
    allowedClasses: ['Fighter', 'Cleric', 'Thief'],
    infravision: 60,
    specialAbilities: ['Resistance to magic', 'Detect stone work'],
  },
  Halfling: {
    name: 'Halfling',
    abilityAdjustments: { dexterity: 1, strength: -1 },
    allowedClasses: ['Fighter', 'Thief'],
    infravision: 0,
    specialAbilities: ['+1 to ranged attacks', 'Resistant to poison and magic'],
  },
  'Half-Elf': {
    name: 'Half-Elf',
    abilityAdjustments: {},
    allowedClasses: ['Fighter', 'Ranger', 'Cleric', 'Magic-User', 'Thief'],
    infravision: 60,
    specialAbilities: ['30% resistance to sleep/charm spells'],
  },
};

// ============================================================================
// CLASS DATA
// ============================================================================

export const CLASSES: Record<CharacterClass, ClassInfo> = {
  Fighter: {
    name: 'Fighter',
    hitDie: 10,
    baseTHAC0: 20,
    thac0Progression: 1,
    savingThrows: { deathMagic: 14, wands: 15, paralysis: 15, breathWeapon: 17, spells: 16 },
    allowedArmor: ['None', 'Leather', 'Chain', 'Plate'],
    allowedWeapons: ['Sword', 'Axe', 'Mace', 'Dagger', 'Bow', 'Crossbow', 'Staff', 'Spear'],
    spellcaster: false,
  },
  Ranger: {
    name: 'Ranger',
    hitDie: 10,
    baseTHAC0: 20,
    thac0Progression: 1,
    savingThrows: { deathMagic: 14, wands: 15, paralysis: 15, breathWeapon: 17, spells: 16 },
    allowedArmor: ['None', 'Leather', 'Chain'],
    allowedWeapons: ['Sword', 'Axe', 'Mace', 'Dagger', 'Bow', 'Crossbow', 'Spear'],
    spellcaster: true,
  },
  Paladin: {
    name: 'Paladin',
    hitDie: 10,
    baseTHAC0: 20,
    thac0Progression: 1,
    savingThrows: { deathMagic: 12, wands: 13, paralysis: 13, breathWeapon: 15, spells: 14 },
    allowedArmor: ['None', 'Leather', 'Chain', 'Plate'],
    allowedWeapons: ['Sword', 'Axe', 'Mace', 'Dagger', 'Bow', 'Crossbow', 'Spear'],
    spellcaster: true,
  },
  Cleric: {
    name: 'Cleric',
    hitDie: 8,
    baseTHAC0: 20,
    thac0Progression: 2,
    savingThrows: { deathMagic: 10, wands: 13, paralysis: 13, breathWeapon: 16, spells: 15 },
    allowedArmor: ['None', 'Leather', 'Chain', 'Plate'],
    allowedWeapons: ['Mace', 'Staff'],
    spellcaster: true,
  },
  'Magic-User': {
    name: 'Magic-User',
    hitDie: 4,
    baseTHAC0: 20,
    thac0Progression: 3,
    savingThrows: { deathMagic: 14, wands: 11, paralysis: 13, breathWeapon: 15, spells: 12 },
    allowedArmor: ['None'],
    allowedWeapons: ['Dagger', 'Staff'],
    spellcaster: true,
  },
  Thief: {
    name: 'Thief',
    hitDie: 6,
    baseTHAC0: 20,
    thac0Progression: 2,
    savingThrows: { deathMagic: 13, wands: 14, paralysis: 12, breathWeapon: 16, spells: 15 },
    allowedArmor: ['None', 'Leather'],
    allowedWeapons: ['Sword', 'Dagger', 'Bow', 'Crossbow'],
    spellcaster: false,
  },
};

// ============================================================================
// XP TABLES (simplified - level 1-10)
// ============================================================================

const XP_TABLES: Record<CharacterClass, number[]> = {
  Fighter: [0, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000],
  Ranger: [0, 2250, 4500, 9000, 18000, 36000, 75000, 150000, 300000, 600000],
  Paladin: [0, 2750, 5500, 12000, 24000, 45000, 95000, 175000, 350000, 700000],
  Cleric: [0, 1500, 3000, 6000, 13000, 27500, 55000, 110000, 225000, 450000],
  'Magic-User': [0, 2500, 5000, 10000, 22500, 40000, 60000, 90000, 135000, 250000],
  Thief: [0, 1250, 2500, 5000, 10000, 20000, 40000, 70000, 110000, 160000],
};

// ============================================================================
// CHARACTER CREATION
// ============================================================================

export class CharacterBuilder {
  /**
   * Roll ability scores using 3d6 method
   */
  static rollAbilities(): AbilityScores {
    return {
      strength: Dice.rollAbilityScore(),
      intelligence: Dice.rollAbilityScore(),
      wisdom: Dice.rollAbilityScore(),
      dexterity: Dice.rollAbilityScore(),
      constitution: Dice.rollAbilityScore(),
      charisma: Dice.rollAbilityScore(),
    };
  }

  /**
   * Apply racial ability adjustments
   */
  static applyRacialAdjustments(abilities: AbilityScores, race: Race): AbilityScores {
    const raceInfo = RACES[race];
    const adjusted = { ...abilities };

    for (const [ability, adjustment] of Object.entries(raceInfo.abilityAdjustments)) {
      adjusted[ability as keyof AbilityScores] += adjustment;
    }

    return adjusted;
  }

  /**
   * Calculate ability modifiers (STR, DEX, CON bonuses)
   */
  static calculateAbilityModifiers(abilities: AbilityScores) {
    return {
      hitBonus: this.getStrengthHitBonus(abilities.strength),
      damageBonus: this.getStrengthDamageBonus(abilities.strength),
      acBonus: this.getDexterityACBonus(abilities.dexterity),
      initiativeBonus: this.getDexterityInitiativeBonus(abilities.dexterity),
      hpBonus: this.getConstitutionHPBonus(abilities.constitution),
      reactionBonus: this.getCharismaReactionBonus(abilities.charisma),
    };
  }

  private static getStrengthHitBonus(str: number): number {
    if (str >= 18) return 3;
    if (str >= 16) return 1;
    if (str >= 13) return 0;
    if (str >= 7) return 0;
    return -1;
  }

  private static getStrengthDamageBonus(str: number): number {
    if (str >= 18) return 3;
    if (str >= 16) return 1;
    if (str >= 7) return 0;
    return -1;
  }

  private static getDexterityACBonus(dex: number): number {
    if (dex >= 18) return -4;
    if (dex >= 16) return -2;
    if (dex >= 15) return -1;
    if (dex >= 7) return 0;
    return 1;
  }

  private static getDexterityInitiativeBonus(dex: number): number {
    if (dex >= 18) return 2;
    if (dex >= 16) return 1;
    if (dex >= 7) return 0;
    return -1;
  }

  private static getConstitutionHPBonus(con: number): number {
    if (con >= 18) return 4;
    if (con >= 17) return 3;
    if (con >= 16) return 2;
    if (con >= 15) return 1;
    if (con >= 7) return 0;
    return -1;
  }

  private static getCharismaReactionBonus(cha: number): number {
    if (cha >= 18) return 7;
    if (cha >= 16) return 5;
    if (cha >= 13) return 3;
    if (cha >= 9) return 0;
    return -2;
  }

  /**
   * Create a new character
   */
  static createCharacter(
    name: string,
    race: Race,
    charClass: CharacterClass,
    alignment: Alignment,
    abilities?: AbilityScores
  ): Character {
    // Roll or use provided abilities
    let finalAbilities = abilities || this.rollAbilities();
    finalAbilities = this.applyRacialAdjustments(finalAbilities, race);

    const classInfo = CLASSES[charClass];
    const modifiers = this.calculateAbilityModifiers(finalAbilities);

    // Roll initial HP
    const hpRoll = Dice.roll(classInfo.hitDie);
    const maxHP = Math.max(1, hpRoll + modifiers.hpBonus);

    // Calculate initial AC (base 10, modified by DEX)
    const baseAC = 10 + modifiers.acBonus;

    const character: Character = {
      id: crypto.randomUUID(),
      name,
      race,
      class: charClass,
      level: 1,
      alignment,
      abilities: finalAbilities,
      combat: {
        thac0: classInfo.baseTHAC0,
        armorClass: baseAC,
        hitPoints: maxHP,
        maxHitPoints: maxHP,
        initiative: modifiers.initiativeBonus,
      },
      saves: { ...classInfo.savingThrows },
      experience: 0,
      nextLevelXP: XP_TABLES[charClass][1],
      equipment: {
        weapon: null,
        armor: null,
        shield: false,
        inventory: [],
      },
      conditions: [],
    };

    // Add spell slots for spellcasters
    if (classInfo.spellcaster) {
      character.spells = {
        known: [],
        memorized: [],
        slotsAvailable: { level1: 1 },
        slotsUsed: {},
      };
    }

    return character;
  }

  /**
   * Level up a character
   */
  static levelUp(character: Character): void {
    const classInfo = CLASSES[character.class];
    character.level++;

    // Roll HP increase
    const hpRoll = Dice.roll(classInfo.hitDie);
    const modifiers = this.calculateAbilityModifiers(character.abilities);
    const hpIncrease = Math.max(1, hpRoll + modifiers.hpBonus);

    character.combat.maxHitPoints += hpIncrease;
    character.combat.hitPoints += hpIncrease;

    // Update THAC0
    if (character.level % classInfo.thac0Progression === 0) {
      character.combat.thac0--;
    }

    // Update saving throws (simplified - improve every 3 levels)
    if (character.level % 3 === 0) {
      character.saves.deathMagic = Math.max(1, character.saves.deathMagic - 1);
      character.saves.wands = Math.max(1, character.saves.wands - 1);
      character.saves.paralysis = Math.max(1, character.saves.paralysis - 1);
      character.saves.breathWeapon = Math.max(1, character.saves.breathWeapon - 1);
      character.saves.spells = Math.max(1, character.saves.spells - 1);
    }

    // Update next level XP
    const xpTable = XP_TABLES[character.class];
    if (character.level < xpTable.length) {
      character.nextLevelXP = xpTable[character.level];
    }
  }

  /**
   * Check if character can level up
   */
  static canLevelUp(character: Character): boolean {
    return character.experience >= character.nextLevelXP;
  }
}
