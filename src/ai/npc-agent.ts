/**
 * LangChain-based NPC Agent Controller
 * Each NPC has an autonomous agent that controls their behavior
 */

import { NPCPersona, generatePersonaPrompt } from './npc-personas';
import { Character } from '../game/types';
import { ITextProvider } from './providers/types';

export interface NPCMemory {
  interactions: InteractionMemory[];
  facts: string[];
  relationships: Map<string, RelationshipLevel>;
  lastUpdated: number;
}

export interface InteractionMemory {
  timestamp: number;
  speaker: string;
  message: string;
  context: string;
}

export type RelationshipLevel =
  | 'Hostile'
  | 'Unfriendly'
  | 'Neutral'
  | 'Friendly'
  | 'Allied';

export interface NPCAction {
  type: 'dialogue' | 'combat' | 'trade' | 'quest' | 'movement' | 'idle';
  description: string;
  target?: string;
  data?: any;
}

export interface NPCDecisionContext {
  npcId: string;
  npcName: string;
  currentLocation: string;
  nearbyEntities: string[];
  partyMembers: Character[];
  recentEvents: string[];
  currentObjective?: string;
}

interface MessageParam {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Individual NPC Agent powered by ITextProvider
 */
export class NPCAgent {
  private id: string;
  private name: string;
  private persona: NPCPersona;
  private provider: ITextProvider;
  private memory: NPCMemory;
  private systemPrompt: string;

  constructor(
    id: string,
    name: string,
    persona: NPCPersona,
    provider: ITextProvider
  ) {
    this.id = id;
    this.name = name;
    this.persona = persona;
    this.provider = provider;

    this.memory = {
      interactions: [],
      facts: [],
      relationships: new Map(),
      lastUpdated: Date.now(),
    };

    this.systemPrompt = generatePersonaPrompt(persona, name);
  }

  /**
   * Get the agent's unique identifier.
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get the agent's name.
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get the agent's persona.
   */
  getPersona(): NPCPersona {
    return this.persona;
  }

  /**
   * Save agent state for persistence.
   */
  saveState(): object {
    return {
      id: this.id,
      name: this.name,
      memory: {
        interactions: this.memory.interactions,
        facts: this.memory.facts,
        relationships: Array.from(this.memory.relationships.entries()),
        lastUpdated: this.memory.lastUpdated,
      },
    };
  }

  /**
   * Load agent state from persistence.
   */
  loadState(state: any): void {
    if (state.memory) {
      this.memory.interactions = state.memory.interactions || [];
      this.memory.facts = state.memory.facts || [];
      this.memory.relationships = new Map(state.memory.relationships || []);
      this.memory.lastUpdated = state.memory.lastUpdated || Date.now();
    }
  }

  /**
   * Process dialogue with the party
   */
  async processDialogue(
    speaker: string,
    message: string,
    context: string
  ): Promise<string> {
    this.addInteraction(speaker, message, context);

    const prompt = `${speaker} says: "${message}"\n\nContext: ${context}\n\nRespond as ${this.name} would, staying in character.`;

    try {
      const response = await this.queryLLM(prompt, 10);
      this.addInteraction(this.name, response, context);
      return response;
    } catch (error) {
      console.error(`[NPC Agent ${this.name}] Dialogue error:`, error);
      return this.getFallbackDialogue();
    }
  }

  /**
   * Make a decision about what action to take
   */
  async decideAction(context: NPCDecisionContext): Promise<NPCAction> {
    const prompt = `Current situation:\nLocation: ${context.currentLocation}\nNearby: ${context.nearbyEntities.join(', ')}\nParty members: ${context.partyMembers.map((c) => c.name).join(', ')}\nRecent events: ${context.recentEvents.join('; ')}\n${context.currentObjective ? `Objective: ${context.currentObjective}` : ''}\n\nBased on your personality, motivations, and the current situation, what do you do?\nChoose ONE action:\n- dialogue: Speak to someone nearby\n- combat: Attack or defend\n- trade: Offer to trade items\n- quest: Offer a quest or task\n- movement: Move to a different location\n- idle: Continue current activity\n\nRespond in this format:\nACTION: [action type]\nDESCRIPTION: [brief description of what you do]\nTARGET: [who or what you're targeting, if applicable]`;

    try {
      const response = await this.queryLLM(prompt, 5);
      return this.parseActionResponse(response);
    } catch (error) {
      console.error(`[NPC Agent ${this.name}] Decision error:`, error);
      return {
        type: 'idle',
        description: `${this.name} continues what they were doing.`,
      };
    }
  }

  /**
   * React to an event in the game world
   */
  async reactToEvent(event: string, context: string): Promise<string> {
    const prompt = `Something happens: ${event}\n\nContext: ${context}\n\nHow do you react? What do you say or do?`;

    try {
      return await this.queryLLM(prompt, 3);
    } catch (error) {
      console.error(`[NPC Agent ${this.name}] Reaction error:`, error);
      return `${this.name} looks surprised.`;
    }
  }

  /**
   * Decide combat action
   */
  async decideCombatAction(
    targets: string[],
    allies: string[],
    currentHP: number,
    maxHP: number
  ): Promise<NPCAction> {
    const hpPercent = (currentHP / maxHP) * 100;

    const prompt = `You are in combat!\nYour HP: ${currentHP}/${maxHP} (${hpPercent.toFixed(0)}%)\nEnemies: ${targets.join(', ')}\nAllies: ${allies.join(', ')}\n\nWhat is your combat strategy? Consider your personality and the situation.\nChoose: attack [target], defend, flee, or use special ability.\n\nRespond with your action and reasoning.`;

    try {
      const response = await this.queryLLM(prompt, 0, { historyOverride: [] });
      return this.parseCombatAction(response, targets);
    } catch (error) {
      console.error(`[NPC Agent ${this.name}] Combat decision error:`, error);
      return {
        type: 'combat',
        description: `${this.name} attacks!`,
        target: targets[0],
      };
    }
  }

  /**
   * Update relationship with a character
   */
  updateRelationship(characterName: string, change: number): void {
    const current = this.memory.relationships.get(characterName) || 'Neutral';
    const levels: RelationshipLevel[] = [
      'Hostile',
      'Unfriendly',
      'Neutral',
      'Friendly',
      'Allied',
    ];

    let currentIndex = levels.indexOf(current);
    currentIndex = Math.max(
      0,
      Math.min(levels.length - 1, currentIndex + change)
    );

    this.memory.relationships.set(characterName, levels[currentIndex]);
  }

  /**
   * Add a fact to memory
   */
  addFact(fact: string): void {
    if (!this.memory.facts.includes(fact)) {
      this.memory.facts.push(fact);
    }
  }

  /**
   * Add an interaction to memory
   */
  private addInteraction(
    speaker: string,
    message: string,
    context: string
  ): void {
    this.memory.interactions.push({
      timestamp: Date.now(),
      speaker,
      message,
      context,
    });

    if (this.memory.interactions.length > 50) {
      this.memory.interactions = this.memory.interactions.slice(-50);
    }

    this.memory.lastUpdated = Date.now();
  }

  /**
   * Build conversation history for the agent
   */
  private buildConversationMessages(limit: number): MessageParam[] {
    const recent = this.memory.interactions.slice(-limit);
    return recent.map((interaction) => {
      const role: MessageParam['role'] =
        interaction.speaker === this.name ? 'assistant' : 'user';
      const context = interaction.context
        ? `\nContext: ${interaction.context}`
        : '';
      return {
        role,
        content: `${interaction.speaker}: ${interaction.message}${context}`,
      };
    });
  }

  /**
   * Query the text provider with persona + history
   */
  private async queryLLM(
    prompt: string,
    historyLimit: number,
    options?: { temperature?: number; maxTokens?: number; historyOverride?: MessageParam[] }
  ): Promise<string> {
    const history = options?.historyOverride ?? this.buildConversationMessages(historyLimit);

    const response = await this.provider.generateText({
      system: this.systemPrompt,
      messages: [
        ...history,
        {
          role: 'user' as const,
          content: prompt,
        },
      ],
      temperature: options?.temperature ?? 0.9,
      maxTokens: options?.maxTokens ?? 200,
    });

    const text = response.content.trim();
    return text || '...';
  }

  /**
   * Parse action response from AI
   */
  private parseActionResponse(response: string): NPCAction {
    const actionMatch = response.match(/ACTION:\s*(\w+)/i);
    const descMatch = response.match(/DESCRIPTION:\s*(.+?)(?=TARGET:|$)/is);
    const targetMatch = response.match(/TARGET:\s*(.+?)$/is);

    const type = actionMatch?.[1]?.toLowerCase() || 'idle';
    const description = descMatch?.[1]?.trim() || response;
    const target = targetMatch?.[1]?.trim();

    return {
      type: type as NPCAction['type'],
      description,
      target,
    };
  }

  /**
   * Parse combat action from AI response
   */
  private parseCombatAction(response: string, targets: string[]): NPCAction {
    const lowerResponse = response.toLowerCase();

    if (lowerResponse.includes('flee') || lowerResponse.includes('run')) {
      return {
        type: 'combat',
        description: `${this.name} attempts to flee!`,
        data: { action: 'flee' },
      };
    }

    if (lowerResponse.includes('defend')) {
      return {
        type: 'combat',
        description: `${this.name} takes a defensive stance.`,
        data: { action: 'defend' },
      };
    }

    const target = targets.find((t) => lowerResponse.includes(t.toLowerCase())) || targets[0];

    return {
      type: 'combat',
      description: `${this.name} attacks ${target}!`,
      target,
      data: { action: 'attack' },
    };
  }

  /**
   * Get fallback dialogue for errors
   */
  private getFallbackDialogue(): string {
    const fallbacks = [
      `${this.name} seems distracted.`,
      `${this.name} nods thoughtfully.`,
      `${this.name} considers their words carefully.`,
      `"Hmm," ${this.name} says.`,
      `${this.name} looks uncertain how to respond.`,
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
