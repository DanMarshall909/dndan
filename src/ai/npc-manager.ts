/**
 * NPC Manager - Coordinates all NPC agents in the game world
 * Manages lifecycle, interactions, and state of all AI-controlled NPCs
 */

import { NPCAgent, NPCDecisionContext, NPCAction } from './npc-agent';
import {
  NPCArchetype,
  NPCPersona,
  generatePersona,
  PERSONA_TEMPLATES,
} from './npc-personas';
import { Alignment } from '../game/types';
import { Character } from '../game/types';

export interface ManagedNPC {
  id: string;
  name: string;
  description: string;
  archetype: NPCArchetype;
  alignment: Alignment;
  persona: NPCPersona;
  agent: NPCAgent;
  position: { x: number; y: number };
  active: boolean;
  lastActionTime: number;
}

/**
 * Central manager for all NPC agents
 */
export class NPCManager {
  private npcs: Map<string, ManagedNPC>;
  private apiKey?: string;
  private updateInterval: number;
  private lastUpdate: number;

  constructor(apiKey?: string, updateInterval: number = 5000) {
    this.npcs = new Map();
    this.apiKey = apiKey;
    this.updateInterval = updateInterval;
    this.lastUpdate = Date.now();
  }

  /**
   * Create a new NPC with an AI agent
   */
  createNPC(
    id: string,
    name: string,
    description: string,
    archetype: NPCArchetype,
    alignment: Alignment,
    position: { x: number; y: number }
  ): ManagedNPC {
    // Generate persona from archetype and alignment
    const persona = generatePersona(archetype, alignment);

    // Create AI agent
    const agent = new NPCAgent(id, name, persona, this.apiKey);

    // Create managed NPC
    const npc: ManagedNPC = {
      id,
      name,
      description,
      archetype,
      alignment,
      persona,
      agent,
      position,
      active: true,
      lastActionTime: Date.now(),
    };

    this.npcs.set(id, npc);

    return npc;
  }

  /**
   * Create a random NPC
   */
  createRandomNPC(
    id: string,
    position: { x: number; y: number }
  ): ManagedNPC {
    const archetypes = Object.keys(PERSONA_TEMPLATES) as NPCArchetype[];
    const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];

    const alignments: Alignment[] = [
      'Lawful Good',
      'Neutral Good',
      'Chaotic Good',
      'Lawful Neutral',
      'True Neutral',
      'Chaotic Neutral',
      'Lawful Evil',
      'Neutral Evil',
      'Chaotic Evil',
    ];

    const alignment = alignments[Math.floor(Math.random() * alignments.length)];

    const name = this.generateRandomName(archetype);
    const description = this.generateDescription(archetype, alignment);

    return this.createNPC(id, name, description, archetype, alignment, position);
  }

  /**
   * Get an NPC by ID
   */
  getNPC(id: string): ManagedNPC | undefined {
    return this.npcs.get(id);
  }

  /**
   * Get all NPCs
   */
  getAllNPCs(): ManagedNPC[] {
    return Array.from(this.npcs.values());
  }

  /**
   * Get NPCs at a location
   */
  getNPCsAt(x: number, y: number, radius: number = 0): ManagedNPC[] {
    return Array.from(this.npcs.values()).filter((npc) => {
      const dx = npc.position.x - x;
      const dy = npc.position.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    });
  }

  /**
   * Process dialogue between a character and an NPC
   */
  async handleDialogue(
    npcId: string,
    speaker: string,
    message: string,
    context: string
  ): Promise<string> {
    const npc = this.npcs.get(npcId);
    if (!npc) {
      return `${npcId} is not available.`;
    }

    try {
      const response = await npc.agent.processDialogue(speaker, message, context);
      npc.lastActionTime = Date.now();
      return response;
    } catch (error) {
      console.error(`[NPC Manager] Dialogue error for ${npc.name}:`, error);
      return `${npc.name} seems confused.`;
    }
  }

  /**
   * Get NPC action decision
   */
  async getNPCAction(
    npcId: string,
    context: NPCDecisionContext
  ): Promise<NPCAction> {
    const npc = this.npcs.get(npcId);
    if (!npc) {
      return {
        type: 'idle',
        description: 'NPC not found',
      };
    }

    try {
      const action = await npc.agent.decideAction(context);
      npc.lastActionTime = Date.now();
      return action;
    } catch (error) {
      console.error(`[NPC Manager] Action decision error for ${npc.name}:`, error);
      return {
        type: 'idle',
        description: `${npc.name} stands around.`,
      };
    }
  }

  /**
   * Process NPC reaction to an event
   */
  async processReaction(
    npcId: string,
    event: string,
    context: string
  ): Promise<string> {
    const npc = this.npcs.get(npcId);
    if (!npc) {
      return '';
    }

    try {
      const reaction = await npc.agent.reactToEvent(event, context);
      npc.lastActionTime = Date.now();
      return reaction;
    } catch (error) {
      console.error(`[NPC Manager] Reaction error for ${npc.name}:`, error);
      return '';
    }
  }

  /**
   * Get combat action for an NPC
   */
  async getCombatAction(
    npcId: string,
    targets: string[],
    allies: string[],
    currentHP: number,
    maxHP: number
  ): Promise<NPCAction> {
    const npc = this.npcs.get(npcId);
    if (!npc) {
      return {
        type: 'combat',
        description: 'NPC not found',
      };
    }

    try {
      const action = await npc.agent.decideCombatAction(
        targets,
        allies,
        currentHP,
        maxHP
      );
      npc.lastActionTime = Date.now();
      return action;
    } catch (error) {
      console.error(`[NPC Manager] Combat action error for ${npc.name}:`, error);
      return {
        type: 'combat',
        description: `${npc.name} attacks!`,
        target: targets[0],
      };
    }
  }

  /**
   * Update NPC position
   */
  updatePosition(npcId: string, x: number, y: number): void {
    const npc = this.npcs.get(npcId);
    if (npc) {
      npc.position = { x, y };
    }
  }

  /**
   * Update NPC relationship with a character
   */
  updateRelationship(npcId: string, characterName: string, change: number): void {
    const npc = this.npcs.get(npcId);
    if (npc) {
      npc.agent.updateRelationship(characterName, change);
    }
  }

  /**
   * Add a fact to NPC's memory
   */
  addNPCFact(npcId: string, fact: string): void {
    const npc = this.npcs.get(npcId);
    if (npc) {
      npc.agent.addFact(fact);
    }
  }

  /**
   * Remove an NPC
   */
  removeNPC(npcId: string): void {
    this.npcs.delete(npcId);
  }

  /**
   * Update all NPCs (called periodically by game engine)
   */
  async updateNPCs(
    partyMembers: Character[],
    worldState: any
  ): Promise<NPCAction[]> {
    const now = Date.now();
    if (now - this.lastUpdate < this.updateInterval) {
      return [];
    }

    this.lastUpdate = now;
    const actions: NPCAction[] = [];

    // Update each active NPC
    for (const npc of this.npcs.values()) {
      if (!npc.active) continue;

      // Build context for this NPC
      const context: NPCDecisionContext = {
        npcId: npc.id,
        npcName: npc.name,
        currentLocation: `(${npc.position.x}, ${npc.position.y})`,
        nearbyEntities: this.getNearbyEntities(npc, worldState),
        partyMembers,
        recentEvents: [],
        currentObjective: this.getObjective(npc),
      };

      // Get NPC action (with rate limiting)
      const timeSinceLastAction = now - npc.lastActionTime;
      if (timeSinceLastAction > 10000) {
        // Only update every 10 seconds
        try {
          const action = await this.getNPCAction(npc.id, context);
          actions.push(action);
        } catch (error) {
          console.error(`[NPC Manager] Update error for ${npc.name}:`, error);
        }
      }
    }

    return actions;
  }

  /**
   * Get nearby entities for an NPC
   */
  private getNearbyEntities(npc: ManagedNPC, worldState: any): string[] {
    const entities: string[] = [];

    // Get other NPCs nearby
    const nearbyNPCs = this.getNPCsAt(npc.position.x, npc.position.y, 5);
    for (const otherNPC of nearbyNPCs) {
      if (otherNPC.id !== npc.id) {
        entities.push(otherNPC.name);
      }
    }

    // Could add monsters, items, etc. from worldState here

    return entities;
  }

  /**
   * Get NPC's current objective
   */
  private getObjective(npc: ManagedNPC): string | undefined {
    // Quest givers want to give quests
    if (npc.persona.questPotential) {
      return 'offer assistance to adventurers';
    }

    // Merchants want to trade
    if (npc.archetype === 'Merchant') {
      return 'sell goods and make profit';
    }

    // Guards want to maintain order
    if (npc.archetype === 'Guard') {
      return 'watch for trouble';
    }

    return undefined;
  }

  /**
   * Generate a random name for an NPC
   */
  private generateRandomName(archetype: NPCArchetype): string {
    const firstNames = [
      'Aldric',
      'Bran',
      'Cedric',
      'Doran',
      'Elara',
      'Fiona',
      'Gareth',
      'Helena',
      'Isolde',
      'Jasper',
      'Kira',
      'Loras',
      'Mira',
      'Nolan',
      'Orin',
      'Petra',
      'Quinn',
      'Rowan',
      'Sera',
      'Theron',
    ];

    const lastNames = [
      'Blackwood',
      'Stormwind',
      'Ironforge',
      'Silverhand',
      'Brightblade',
      'Darkwater',
      'Goldleaf',
      'Stoneheart',
      'Swiftarrow',
      'Thornwood',
    ];

    const firstName =
      firstNames[Math.floor(Math.random() * firstNames.length)];

    // Some archetypes use single names
    if (
      ['Priest', 'Hermit', 'Mysterious Stranger'].includes(archetype)
    ) {
      return firstName;
    }

    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
  }

  /**
   * Generate a description for an NPC
   */
  private generateDescription(
    archetype: NPCArchetype,
    alignment: Alignment
  ): string {
    const templates: Record<NPCArchetype, string[]> = {
      Merchant: [
        'a shrewd trader with a keen eye for profit',
        'a well-dressed merchant with exotic wares',
        'a friendly shopkeeper always ready to make a deal',
      ],
      Guard: [
        'a stern-faced guard in polished armor',
        'a watchful sentinel protecting the peace',
        'a veteran soldier on duty',
      ],
      Innkeeper: [
        'a jovial host who knows everyone\'s business',
        'a warm and welcoming innkeeper',
        'a chatty tavern owner with endless stories',
      ],
      QuestGiver: [
        'a worried citizen seeking heroes',
        'a mysterious figure with an important task',
        'a desperate soul in need of help',
      ],
      Hermit: [
        'a reclusive sage living apart from society',
        'a wise hermit who communes with nature',
        'a mysterious recluse with ancient knowledge',
      ],
      Priest: [
        'a devoted cleric serving their deity',
        'a holy figure radiating divine grace',
        'a pious priest tending to the faithful',
      ],
      Thief: [
        'a shadowy figure with quick hands',
        'a cunning rogue with a silver tongue',
        'a sneaky character lurking in the shadows',
      ],
      Noble: [
        'an aristocrat in fine clothing',
        'a proud noble of distinguished lineage',
        'a wealthy and influential figure',
      ],
      Peasant: [
        'a humble commoner working the land',
        'a simple farmer with weather-worn hands',
        'a poor villager struggling to survive',
      ],
      Scholar: [
        'a learned sage surrounded by tomes',
        'an intellectual researcher pursuing knowledge',
        'a bookish scholar lost in thought',
      ],
      Blacksmith: [
        'a muscular craftsman covered in soot',
        'a skilled smith hammering at the forge',
        'a burly blacksmith with powerful arms',
      ],
      'Mysterious Stranger': [
        'a cloaked figure shrouded in mystery',
        'an enigmatic wanderer with knowing eyes',
        'a strange traveler who appears from nowhere',
      ],
    };

    const archetypeTemplates = templates[archetype] || ['an ordinary person'];
    const description =
      archetypeTemplates[Math.floor(Math.random() * archetypeTemplates.length)];

    return description;
  }

  /**
   * Save all NPC states
   */
  saveState() {
    const npcStates: any[] = [];

    for (const npc of this.npcs.values()) {
      npcStates.push({
        id: npc.id,
        name: npc.name,
        description: npc.description,
        archetype: npc.archetype,
        alignment: npc.alignment,
        position: npc.position,
        active: npc.active,
        agentState: npc.agent.saveState(),
      });
    }

    return npcStates;
  }

  /**
   * Load NPC states
   */
  loadState(states: any[]): void {
    this.npcs.clear();

    for (const state of states) {
      const npc = this.createNPC(
        state.id,
        state.name,
        state.description,
        state.archetype,
        state.alignment,
        state.position
      );

      npc.active = state.active;
      npc.agent.loadState(state.agentState);
    }
  }
}
