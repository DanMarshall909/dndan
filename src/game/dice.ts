/**
 * Dice rolling utilities for D&D mechanics
 */

export class Dice {
  /**
   * Roll a die with the specified number of sides
   */
  static roll(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }

  /**
   * Roll multiple dice and return the sum
   * @param count Number of dice to roll
   * @param sides Number of sides on each die
   * @param modifier Bonus/penalty to add to the total
   */
  static rollDice(count: number, sides: number, modifier: number = 0): number {
    let total = modifier;
    for (let i = 0; i < count; i++) {
      total += this.roll(sides);
    }
    return total;
  }

  /**
   * Roll NdM+X (e.g., "3d6+2")
   */
  static rollFormula(formula: string): number {
    const match = formula.match(/(\d+)d(\d+)([+-]\d+)?/i);
    if (!match) {
      throw new Error(`Invalid dice formula: ${formula}`);
    }

    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;

    return this.rollDice(count, sides, modifier);
  }

  /**
   * Roll 3d6 for ability score
   */
  static rollAbilityScore(): number {
    return this.rollDice(3, 6);
  }

  /**
   * Roll 4d6, drop lowest (alternate ability score method)
   */
  static rollAbilityScore4d6DropLowest(): number {
    const rolls = [this.roll(6), this.roll(6), this.roll(6), this.roll(6)];
    rolls.sort((a, b) => a - b);
    return rolls[1] + rolls[2] + rolls[3]; // Skip the lowest (index 0)
  }

  /**
   * Roll percentile dice (d100)
   */
  static rollPercentile(): number {
    return this.roll(100);
  }

  /**
   * Roll on a table with weighted probabilities
   */
  static rollTable<T>(table: { weight: number; value: T }[]): T {
    const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const entry of table) {
      roll -= entry.weight;
      if (roll <= 0) {
        return entry.value;
      }
    }

    return table[table.length - 1].value;
  }
}
