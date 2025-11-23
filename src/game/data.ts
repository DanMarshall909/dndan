/**
 * Game data: monsters, items, weapons, armor
 */

import { Monster, Weapon, Armor, Item } from './types';

// ============================================================================
// WEAPONS
// ============================================================================

export const WEAPONS: Record<string, Weapon> = {
  dagger: {
    name: 'Dagger',
    type: 'Dagger',
    damage: '1d4',
    twoHanded: false,
    weight: 1,
  },
  shortsword: {
    name: 'Short Sword',
    type: 'Sword',
    damage: '1d6',
    twoHanded: false,
    weight: 3,
  },
  longsword: {
    name: 'Long Sword',
    type: 'Sword',
    damage: '1d8',
    twoHanded: false,
    weight: 4,
  },
  twohanded: {
    name: 'Two-Handed Sword',
    type: 'Sword',
    damage: '1d10',
    twoHanded: true,
    weight: 15,
  },
  mace: {
    name: 'Mace',
    type: 'Mace',
    damage: '1d6',
    twoHanded: false,
    weight: 8,
  },
  battleaxe: {
    name: 'Battle Axe',
    type: 'Axe',
    damage: '1d8',
    twoHanded: false,
    weight: 7,
  },
  spear: {
    name: 'Spear',
    type: 'Spear',
    damage: '1d6',
    twoHanded: false,
    weight: 5,
  },
  shortbow: {
    name: 'Short Bow',
    type: 'Bow',
    damage: '1d6',
    range: 50,
    twoHanded: true,
    weight: 2,
  },
  longbow: {
    name: 'Long Bow',
    type: 'Bow',
    damage: '1d8',
    range: 70,
    twoHanded: true,
    weight: 3,
  },
  staff: {
    name: 'Quarterstaff',
    type: 'Staff',
    damage: '1d6',
    twoHanded: true,
    weight: 4,
  },
};

// ============================================================================
// ARMOR
// ============================================================================

export const ARMOR: Record<string, Armor> = {
  none: {
    name: 'No Armor',
    type: 'None',
    armorClass: 10,
    weight: 0,
  },
  leather: {
    name: 'Leather Armor',
    type: 'Leather',
    armorClass: 8,
    weight: 15,
  },
  chainmail: {
    name: 'Chain Mail',
    type: 'Chain',
    armorClass: 5,
    weight: 40,
  },
  platemail: {
    name: 'Plate Mail',
    type: 'Plate',
    armorClass: 3,
    weight: 50,
  },
};

// ============================================================================
// MONSTERS
// ============================================================================

export const MONSTER_TEMPLATES: Record<string, Omit<Monster, 'id' | 'hitPoints'>> = {
  goblin: {
    name: 'Goblin',
    hitDice: '1d8',
    armorClass: 6,
    thac0: 20,
    attacks: [{ name: 'Short Sword', damage: '1d6' }],
    movement: 6,
    morale: 7,
    xpValue: 15,
    specialAbilities: ['Infravision 60ft'],
    description: 'A small, vicious humanoid with yellowish skin and sharp teeth.',
  },
  orc: {
    name: 'Orc',
    hitDice: '1d8',
    armorClass: 6,
    thac0: 19,
    attacks: [{ name: 'Axe', damage: '1d8' }],
    movement: 9,
    morale: 8,
    xpValue: 15,
    specialAbilities: ['Infravision 60ft'],
    description: 'A brutish humanoid with gray-green skin and tusks.',
  },
  skeleton: {
    name: 'Skeleton',
    hitDice: '1d8',
    armorClass: 7,
    thac0: 19,
    attacks: [{ name: 'Claw', damage: '1d6' }],
    movement: 12,
    morale: 12,
    xpValue: 15,
    specialAbilities: ['Undead', 'Immune to sleep/charm'],
    description: 'Animated bones held together by dark magic.',
  },
  zombie: {
    name: 'Zombie',
    hitDice: '2d8',
    armorClass: 8,
    thac0: 19,
    attacks: [{ name: 'Slam', damage: '1d8' }],
    movement: 6,
    morale: 12,
    xpValue: 35,
    specialAbilities: ['Undead', 'Immune to sleep/charm'],
    description: 'A shambling corpse animated by necromancy.',
  },
  ogre: {
    name: 'Ogre',
    hitDice: '4d8+1',
    armorClass: 5,
    thac0: 17,
    attacks: [{ name: 'Club', damage: '1d10' }],
    movement: 9,
    morale: 10,
    xpValue: 175,
    specialAbilities: [],
    description: 'A huge, brutish giant with thick skin and a foul temper.',
  },
  troll: {
    name: 'Troll',
    hitDice: '6d8+3',
    armorClass: 4,
    thac0: 15,
    attacks: [
      { name: 'Claw', damage: '1d6' },
      { name: 'Claw', damage: '1d6' },
      { name: 'Bite', damage: '1d10' },
    ],
    movement: 12,
    morale: 10,
    xpValue: 650,
    specialAbilities: ['Regeneration 3 HP/round', 'Vulnerable to fire/acid'],
    description: 'A large, lanky creature with rubbery green skin and fearsome claws.',
  },
  youngdragon: {
    name: 'Young Red Dragon',
    hitDice: '8d8+8',
    armorClass: 2,
    thac0: 13,
    attacks: [
      { name: 'Bite', damage: '1d10' },
      { name: 'Claw', damage: '1d6' },
      { name: 'Claw', damage: '1d6' },
    ],
    movement: 24,
    morale: 15,
    xpValue: 2000,
    specialAbilities: ['Fire Breath 8d10', 'Flying'],
    description: 'A crimson-scaled dragon wreathed in smoke and flame.',
  },
};

// ============================================================================
// ITEMS
// ============================================================================

export const ITEM_TEMPLATES: Record<string, Omit<Item, 'id'>> = {
  healingPotion: {
    name: 'Potion of Healing',
    type: 'Potion',
    description: 'Restores 1d8+1 hit points when consumed.',
    weight: 0.5,
    value: 200,
    magical: true,
  },
  torch: {
    name: 'Torch',
    type: 'Treasure',
    description: 'Provides light for 6 turns (1 hour).',
    weight: 1,
    value: 1,
    magical: false,
  },
  rope: {
    name: 'Rope (50ft)',
    type: 'Treasure',
    description: 'A sturdy hemp rope.',
    weight: 5,
    value: 1,
    magical: false,
  },
  goldCoins: {
    name: 'Gold Coins',
    type: 'Treasure',
    description: 'Shiny gold coins.',
    weight: 0.1,
    value: 1,
    magical: false,
  },
};
