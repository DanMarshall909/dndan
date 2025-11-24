/**
 * AI Dungeon Master using Claude (via backend proxy)
 */

import { Character, Monster } from '../game/types';
import { AttackResult } from '../game/combat';

export interface DMResponse {
  narrative: string;
  suggestions?: string[];
}

interface MessageParam {
  role: 'user' | 'assistant';
  content: string;
}

export class AIDungeonMaster {
  private apiUrl: string;
  private conversationHistory: MessageParam[];

  constructor(apiUrl: string = 'http://localhost:3001/api/claude') {
    this.apiUrl = apiUrl;
    this.conversationHistory = [];
  }

  /**
   * Initialize the DM with game context
   */
  async initializeAdventure(party: Character[]): Promise<DMResponse> {
    const partyDesc = party
      .map((c) => `${c.name} (${c.race} ${c.class}, level ${c.level})`)
      .join(', ');

    const prompt = `You are the Dungeon Master for an AD&D 1st/2nd Edition game.
The party consists of: ${partyDesc}.

Begin their adventure by describing how they arrive at the entrance to a mysterious dungeon.
Set the scene, describe the atmosphere, and provide them with their initial goal.

Keep the narrative engaging, atmospheric, and true to classic D&D adventures.
Respond in 2-3 paragraphs.`;

    return await this.sendMessage(prompt);
  }

  /**
   * Describe a new area/room
   */
  async describeLocation(
    description: string,
    entities: string[]
  ): Promise<DMResponse> {
    const prompt = `The party enters a new area: ${description}.
${entities.length > 0 ? `They see: ${entities.join(', ')}.` : 'The area appears empty.'}

Describe what the party sees, hears, and smells. Make it atmospheric and immersive.
Keep it to 2-3 sentences.`;

    return await this.sendMessage(prompt);
  }

  /**
   * Narrate combat initiation
   */
  async narrateCombatStart(monsters: Monster[]): Promise<DMResponse> {
    const monsterList = monsters.map((m) => m.name).join(', ');

    const prompt = `The party encounters hostile creatures: ${monsterList}.

Describe how the encounter begins. What do the monsters do? How do they react to the party?
Keep it dramatic and exciting. 1-2 sentences.`;

    return await this.sendMessage(prompt);
  }

  /**
   * Narrate combat attack
   */
  async narrateCombatAction(
    attackerName: string,
    targetName: string,
    result: AttackResult,
    _isPlayerAttack: boolean
  ): Promise<DMResponse> {
    const outcome = result.hit
      ? result.critical
        ? `lands a CRITICAL HIT for ${result.damage} damage`
        : `hits for ${result.damage} damage`
      : 'misses';

    const prompt = `${attackerName} attacks ${targetName} and ${outcome}.

Provide a brief, dramatic description of the attack. 1 sentence.`;

    return await this.sendMessage(prompt);
  }

  /**
   * Generate NPC dialogue
   */
  async generateNPCDialogue(
    npcName: string,
    npcDescription: string,
    context: string
  ): Promise<DMResponse> {
    const prompt = `The party speaks with ${npcName}, ${npcDescription}.
Context: ${context}

Generate appropriate dialogue for this NPC. What do they say? How do they react?
Keep it in-character and period-appropriate for a fantasy medieval setting.
2-3 sentences of dialogue.`;

    return await this.sendMessage(prompt);
  }

  /**
   * Generate quest hook
   */
  async generateQuest(
    location: string,
    partyLevel: number
  ): Promise<DMResponse> {
    const prompt = `Create a quest appropriate for a level ${partyLevel} party in ${location}.

Describe the quest hook: who needs help, what the problem is, and what the reward might be.
Keep it classic D&D style - not too complex. 2-3 sentences.`;

    return await this.sendMessage(prompt);
  }

  /**
   * Handle player action with uncertain outcome
   */
  async handlePlayerAction(
    action: string,
    context: string
  ): Promise<DMResponse> {
    const prompt = `The party attempts to: ${action}
Context: ${context}

As the DM, describe what happens. Determine the outcome and any consequences.
Be fair but add interesting twists when appropriate. 2-3 sentences.`;

    return await this.sendMessage(prompt);
  }

  /**
   * Generate trap description
   */
  async describeTrap(trapType: string): Promise<DMResponse> {
    const prompt = `The party triggers a ${trapType} trap.

Describe what happens in dramatic detail. What do they see/hear/feel?
1-2 sentences.`;

    return await this.sendMessage(prompt);
  }

  /**
   * Generate treasure description
   */
  async describeTreasure(items: string[]): Promise<DMResponse> {
    const prompt = `The party finds treasure: ${items.join(', ')}.

Describe how the treasure is presented and the party's discovery.
Make it feel rewarding. 1-2 sentences.`;

    return await this.sendMessage(prompt);
  }

  /**
   * Send a message to Claude and get response
   */
  private async sendMessage(prompt: string): Promise<DMResponse> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: prompt,
      });

      // Keep conversation history manageable (last 20 messages)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: this.conversationHistory,
          system: `You are an experienced Dungeon Master for AD&D 1st/2nd Edition.
Your narration is atmospheric, engaging, and true to classic fantasy adventure.
Keep responses concise but evocative. Use vivid sensory details.
Maintain the spirit of old-school D&D - challenging but fair.`,
          temperature: 0.8,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const narrative = data.narrative || 'The DM considers the situation...';

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: narrative,
      });

      return {
        narrative,
        suggestions: [],
      };
    } catch (error) {
      console.error('[AI DM] Error:', error);
      return {
        narrative: 'The ancient magic falters momentarily...',
        suggestions: [],
      };
    }
  }

  /**
   * Reset conversation history
   */
  reset(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history for saving
   */
  getHistory(): MessageParam[] {
    return [...this.conversationHistory];
  }

  /**
   * Load conversation history
   */
  loadHistory(history: MessageParam[]): void {
    this.conversationHistory = [...history];
  }
}
