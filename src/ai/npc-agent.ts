/**
 * LangChain-based NPC Agent Controller
 * Each NPC has an autonomous agent that controls their behavior
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { AIMessage, HumanMessage, BaseMessage } from '@langchain/core/messages';
import { NPCPersona, generatePersonaPrompt } from './npc-personas';
import { Character } from '../game/types';

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

/**
 * Individual NPC Agent powered by LangChain
 */
export class NPCAgent {
  private id: string;
  private name: string;
  private persona: NPCPersona;
  private model: ChatAnthropic;
  private memory: NPCMemory;
  private conversationChain: any;
  private systemPrompt: string;

  constructor(
    id: string,
    name: string,
    persona: NPCPersona,
    apiKey?: string
  ) {
    this.id = id;
    this.name = name;
    this.persona = persona;

    // Initialize LangChain ChatAnthropic model
    this.model = new ChatAnthropic({
      modelName: 'claude-sonnet-4-5-20250929',
      temperature: 0.9, // Higher temperature for more varied NPC behavior
      maxTokens: 200,
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });

    // Initialize memory
    this.memory = {
      interactions: [],
      facts: [],
      relationships: new Map(),
      lastUpdated: Date.now(),
    };

    // Generate system prompt from persona
    this.systemPrompt = generatePersonaPrompt(persona, name);

    // Initialize conversation chain
    this.initializeChain();
  }

  /**
   * Initialize the LangChain conversation chain
   */
  private initializeChain(): void {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', this.systemPrompt],
      new MessagesPlaceholder('history'),
      ['human', '{input}'],
    ]);

    this.conversationChain = prompt.pipe(this.model).pipe(new StringOutputParser());
  }

  /**
   * Process dialogue with the party
   */
  async processDialogue(
    speaker: string,
    message: string,
    context: string
  ): Promise<string> {
    // Add to memory
    this.addInteraction(speaker, message, context);

    // Build conversation history
    const history = this.buildConversationHistory();

    // Generate response
    const input = `${speaker} says: "${message}"\n\nContext: ${context}\n\nRespond as ${this.name} would, staying in character.`;

    try {
      const response = await this.conversationChain.invoke({
        history,
        input,
      });

      // Store the response in memory
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
    const prompt = `Current situation:
Location: ${context.currentLocation}
Nearby: ${context.nearbyEntities.join(', ')}
Party members: ${context.partyMembers.map((c) => c.name).join(', ')}
Recent events: ${context.recentEvents.join('; ')}
${context.currentObjective ? `Objective: ${context.currentObjective}` : ''}

Based on your personality, motivations, and the current situation, what do you do?
Choose ONE action:
- dialogue: Speak to someone nearby
- combat: Attack or defend
- trade: Offer to trade items
- quest: Offer a quest or task
- movement: Move to a different location
- idle: Continue current activity

Respond in this format:
ACTION: [action type]
DESCRIPTION: [brief description of what you do]
TARGET: [who or what you're targeting, if applicable]`;

    try {
      const history = this.buildRecentHistory(5);
      const response = await this.conversationChain.invoke({
        history,
        input: prompt,
      });

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
      const history = this.buildRecentHistory(3);
      const response = await this.conversationChain.invoke({
        history,
        input: prompt,
      });

      return response;
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

    const prompt = `You are in combat!
Your HP: ${currentHP}/${maxHP} (${hpPercent.toFixed(0)}%)
Enemies: ${targets.join(', ')}
Allies: ${allies.join(', ')}

What is your combat strategy? Consider your personality and the situation.
Choose: attack [target], defend, flee, or use special ability.

Respond with your action and reasoning.`;

    try {
      const response = await this.conversationChain.invoke({
        history: [],
        input: prompt,
      });

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

    // Keep only last 50 interactions
    if (this.memory.interactions.length > 50) {
      this.memory.interactions = this.memory.interactions.slice(-50);
    }

    this.memory.lastUpdated = Date.now();
  }

  /**
   * Build conversation history for the agent
   */
  private buildConversationHistory(): BaseMessage[] {
    const recent = this.memory.interactions.slice(-10);
    const history: BaseMessage[] = [];

    for (const interaction of recent) {
      if (interaction.speaker === this.name) {
        history.push(new AIMessage(interaction.message));
      } else {
        history.push(
          new HumanMessage(`${interaction.speaker}: ${interaction.message}`)
        );
      }
    }

    return history;
  }

  /**
   * Build recent history
   */
  private buildRecentHistory(count: number): BaseMessage[] {
    const recent = this.memory.interactions.slice(-count);
    return recent.map((interaction) => {
      if (interaction.speaker === this.name) {
        return new AIMessage(interaction.message);
      } else {
        return new HumanMessage(
          `${interaction.speaker}: ${interaction.message}`
        );
      }
    });
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

    // Default: attack
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

  /**
   * Get NPC info
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      persona: this.persona,
      memory: this.memory,
    };
  }

  /**
   * Save agent state
   */
  saveState() {
    return {
      id: this.id,
      name: this.name,
      persona: this.persona,
      memory: this.memory,
    };
  }

  /**
   * Load agent state
   */
  loadState(state: any): void {
    this.memory = state.memory;
  }
}
