/**
 * Core type definitions for AD&D 1st/2nd Edition mechanics
 */

// ============================================================================
// ABILITY SCORES
// ============================================================================

export interface AbilityScores {
  strength: number;
  intelligence: number;
  wisdom: number;
  dexterity: number;
  constitution: number;
  charisma: number;
}

export interface AbilityModifiers {
  hitBonus: number;      // Melee attack/damage (STR)
  damageBonus: number;   // Melee damage (STR)
  acBonus: number;       // AC adjustment (DEX)
  initiativeBonus: number; // Initiative (DEX)
  hpBonus: number;       // HP per level (CON)
  reactionBonus: number; // NPC reactions (CHA)
}

// ============================================================================
// CHARACTER CLASSES
// ============================================================================

export type CharacterClass =
  | 'Fighter'
  | 'Ranger'
  | 'Paladin'
  | 'Cleric'
  | 'Magic-User'
  | 'Thief';

export interface ClassInfo {
  name: CharacterClass;
  hitDie: number;           // Hit die type (d4, d6, d8, d10)
  baseTHAC0: number;        // THAC0 at level 1
  thac0Progression: number; // Improves every X levels
  savingThrows: SavingThrows;
  allowedArmor: ArmorType[];
  allowedWeapons: WeaponType[];
  spellcaster: boolean;
}

// ============================================================================
// RACES
// ============================================================================

export type Race = 'Human' | 'Elf' | 'Dwarf' | 'Halfling' | 'Half-Elf';

export interface RaceInfo {
  name: Race;
  abilityAdjustments: Partial<AbilityScores>;
  allowedClasses: CharacterClass[];
  infravision: number; // Range in feet (0 if none)
  specialAbilities: string[];
}

// ============================================================================
// ALIGNMENT
// ============================================================================

export type Alignment =
  | 'Lawful Good'
  | 'Neutral Good'
  | 'Chaotic Good'
  | 'Lawful Neutral'
  | 'True Neutral'
  | 'Chaotic Neutral'
  | 'Lawful Evil'
  | 'Neutral Evil'
  | 'Chaotic Evil';

// ============================================================================
// SAVING THROWS
// ============================================================================

export interface SavingThrows {
  deathMagic: number;     // Death Ray, Poison
  wands: number;          // Wands, Rods
  paralysis: number;      // Paralysis, Turn to Stone
  breathWeapon: number;   // Dragon Breath
  spells: number;         // Spells, Rods, Staves
}

// ============================================================================
// COMBAT
// ============================================================================

export interface CombatStats {
  thac0: number;          // To Hit Armor Class 0
  armorClass: number;     // AC (lower is better)
  hitPoints: number;      // Current HP
  maxHitPoints: number;   // Maximum HP
  initiative: number;     // Initiative modifier
}

export type WeaponType = 'Sword' | 'Axe' | 'Mace' | 'Dagger' | 'Bow' | 'Crossbow' | 'Staff' | 'Spear';
export type ArmorType = 'None' | 'Leather' | 'Chain' | 'Plate';

export interface Weapon {
  name: string;
  type: WeaponType;
  damage: string;         // Dice formula (e.g., "1d8")
  range?: number;         // Range in feet (for ranged weapons)
  twoHanded: boolean;
  weight: number;         // In pounds
}

export interface Armor {
  name: string;
  type: ArmorType;
  armorClass: number;     // AC value
  weight: number;         // In pounds
}

// ============================================================================
// SPELLS
// ============================================================================

export type SpellLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface Spell {
  name: string;
  level: SpellLevel;
  school: string;
  castingTime: string;
  range: string;
  duration: string;
  savingThrow: string;
  description: string;
}

export interface SpellSlots {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  level6: number;
  level7: number;
  level8: number;
  level9: number;
}

// ============================================================================
// CHARACTER
// ============================================================================

export interface Character {
  id: string;
  name: string;
  race: Race;
  class: CharacterClass;
  level: number;
  alignment: Alignment;

  // Ability Scores
  abilities: AbilityScores;

  // Combat
  combat: CombatStats;

  // Saving Throws
  saves: SavingThrows;

  // Experience
  experience: number;
  nextLevelXP: number;

  // Equipment
  equipment: {
    weapon: Weapon | null;
    armor: Armor | null;
    shield: boolean;
    inventory: Item[];
  };

  // Spells (if spellcaster)
  spells?: {
    known: Spell[];
    memorized: Spell[];
    slotsAvailable: Partial<SpellSlots>;
    slotsUsed: Partial<SpellSlots>;
  };

  // Status
  conditions: StatusCondition[];
}

export type StatusCondition =
  | 'Poisoned'
  | 'Paralyzed'
  | 'Sleeping'
  | 'Charmed'
  | 'Blessed'
  | 'Cursed';

// ============================================================================
// ITEMS
// ============================================================================

export type ItemType = 'Weapon' | 'Armor' | 'Potion' | 'Scroll' | 'Treasure' | 'Quest';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  weight: number;
  value: number; // In gold pieces
  magical: boolean;
}

// ============================================================================
// MONSTERS
// ============================================================================

export interface Monster {
  id: string;
  name: string;
  hitDice: string;        // e.g., "3d8+3"
  hitPoints: number;
  armorClass: number;
  thac0: number;
  attacks: MonsterAttack[];
  movement: number;       // Movement rate
  morale: number;         // Morale score
  xpValue: number;
  specialAbilities: string[];
  description: string;
}

export interface MonsterAttack {
  name: string;
  damage: string;         // Dice formula
  special?: string;       // Special effects (poison, etc.)
}
