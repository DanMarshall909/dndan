/**
 * Main game engine - orchestrates all systems
 */

import { World } from '../map/world';
import { DungeonGenerator } from '../map/generator';
import { Character, Monster } from './types';
import { CharacterBuilder } from './character';
import { CombatEngine } from './combat';
import { TurnManager, PlayerAction } from './turn-manager';
import { AIDungeonMaster } from '../ai/dm';
import { NPCManager } from '../ai/npc-manager';
import { SceneCache } from '../ai/cache';
import { SceneGenerator, ImageGenerationConfig } from '../ai/scene-gen';
import { createSingleResponseProvider } from '../ai/providers/test-provider';
import { Renderer } from '../render/renderer';
import { GameUI } from '../render/ui';
import { Minimap } from '../render/minimap';
import { InputController, ActionType } from '../input/controls';
import { SceneDescriptor, Entity, NPC } from '../map/types';
import { Dice } from './dice';
import { MONSTER_TEMPLATES } from './data';

export enum GameState {
  Initializing,
  Exploring,
  Combat,
  Dialogue,
  Menu,
  GameOver,
}

export class GameEngine {
  private world: World;
  private party: Character[];
  private currentCharacter: Character | null;
  private state: GameState;
  private dm: AIDungeonMaster;
  private npcManager: NPCManager;
  private sceneCache: SceneCache;
  private sceneGen: SceneGenerator;
  private renderer: Renderer;
  private ui: GameUI;
  private minimap: Minimap;
  private input: InputController;
  private isGeneratingScene: boolean;
  private currentDialogueNPC: string | null;
  private currentNarrative: string | null;
  private recentEvents: string[];
  private turnManager: TurnManager | null;
  private currentCombatMonsters: Monster[];

  constructor(
    canvas: HTMLCanvasElement,
    uiContainerId: string,
    imageConfig: ImageGenerationConfig
  ) {
    this.world = new World();
    this.party = [];
    this.currentCharacter = null;
    this.state = GameState.Initializing;
    this.isGeneratingScene = false;
    this.currentDialogueNPC = null;
    this.currentNarrative = null;
    this.recentEvents = [];
    this.turnManager = null;
    this.currentCombatMonsters = [];

    // Initialize AI systems
    this.dm = new AIDungeonMaster(); // Uses backend proxy
    // TODO: Replace with proper LangChain provider configured for the target LLM
    const npcProvider = createSingleResponseProvider('The NPC looks at you thoughtfully.');
    this.npcManager = new NPCManager(npcProvider, 10000); // 10 second update interval
    this.sceneCache = new SceneCache(500);
    this.sceneGen = new SceneGenerator(imageConfig);

    // Initialize rendering
    this.renderer = new Renderer(canvas, 160, 100, 2);
    this.ui = new GameUI(uiContainerId);
    this.minimap = new Minimap(this.ui.getMinimapCanvas());

    // Initialize input
    this.input = new InputController();
  }

  /**
   * Initialize a new game
   */
  async initializeGame(): Promise<void> {
    this.ui.addMessage('Initializing D&D AN...', '#ff0');

    // Create a test character
    const character = CharacterBuilder.createCharacter(
      'Thorin',
      'Dwarf',
      'Fighter',
      'Lawful Good'
    );

    // Give starting equipment
    const { WEAPONS, ARMOR } = await import('./data');
    character.equipment.weapon = WEAPONS.longsword;
    character.equipment.armor = ARMOR.chainmail;
    character.combat.armorClass = CombatEngine.calculateAC(
      ARMOR.chainmail.armorClass,
      CharacterBuilder.calculateAbilityModifiers(character.abilities).acBonus,
      false
    );

    this.party.push(character);
    this.currentCharacter = character;

    // Generate dungeon
    this.ui.addMessage('Generating dungeon...', '#0ff');
    const generator = new DungeonGenerator();
    const dungeon = generator.generateDungeon(50, 50, 1);
    generator.applyToWorld(dungeon, this.world);

    // Spawn some monsters
    this.spawnMonsters(5);

    // Spawn some NPCs
    this.spawnNPCs(3);
    this.ui.addMessage('AI-controlled NPCs spawned in the dungeon...', '#0ff');

    // Initialize adventure with AI DM
    this.ui.addMessage('The Dungeon Master prepares your adventure...', '#ff0');
    const intro = await this.dm.initializeAdventure(this.party);
    this.ui.addMessage(intro.narrative, '#fff');
    this.setNarrative(intro.narrative);
    this.addEvent('Adventure begins at the dungeon entrance');

    // Update UI
    this.ui.updateStats(character);
    this.ui.showControls();

    // Render initial scene and minimap
    await this.renderCurrentScene();
    this.updateMinimap();

    this.state = GameState.Exploring;
    this.ui.addMessage('Adventure begins!', '#ff0');

    // Start game loop
    this.gameLoop();
  }

  /**
   * Main game loop
   */
  private gameLoop(): void {
    const tick = async () => {
      // Process input
      if (this.input.hasPendingActions() && !this.isGeneratingScene) {
        const action = this.input.getNextAction();
        if (action) {
          await this.handleAction(action.type);
        }
      }

      // Continue loop
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  /**
   * Handle player actions
   */
  private async handleAction(action: ActionType): Promise<void> {
    // Handle combat actions
    if (this.state === GameState.Combat) {
      await this.handleCombatAction(action);
      return;
    }

    // Handle exploration actions
    if (this.state !== GameState.Exploring) return;

    const direction = InputController.actionToDirection(action);
    if (direction) {
      // Movement
      const moved = this.world.movePlayer(direction);
      if (moved) {
        this.ui.addMessage(`You move ${direction.toLowerCase()}.`);
        this.addEvent(`Moved ${direction.toLowerCase()}`);
        await this.renderCurrentScene();
        this.updateMinimap();

        // Check for encounters
        this.checkForEncounters();
      } else {
        this.ui.addMessage('Your path is blocked.', '#f00');
      }
    } else if (action === 'RotateLeft') {
      this.world.rotatePlayer(false);
      this.ui.addMessage('You turn left.');
      await this.renderCurrentScene();
      this.updateMinimap();
    } else if (action === 'RotateRight') {
      this.world.rotatePlayer(true);
      this.ui.addMessage('You turn right.');
      await this.renderCurrentScene();
      this.updateMinimap();
    } else if (action === 'Interact') {
      this.handleInteract();
    } else if (action === 'CharacterSheet') {
      this.showCharacterSheet();
    } else if (action === 'Rest') {
      this.handleRest();
    }
  }

  /**
   * Render the current scene
   */
  private async renderCurrentScene(): Promise<void> {
    this.isGeneratingScene = true;

    try {
      // Build scene descriptor
      const viewState = this.world.getPlayerViewState();
      const visibleTiles = this.world.getVisibleTiles(5);
      const visibleEntities: Entity[] = [];

      // Get entities in visible tiles
      for (const pos of visibleTiles) {
        const entities = this.world.getEntitiesAt(pos);
        visibleEntities.push(...entities);
      }

      const descriptor: SceneDescriptor = {
        viewState,
        visibleTiles: [],
        visibleEntities,
        lighting: this.world.getState().lighting,
        timeOfDay: this.world.getTimeOfDay(),
        narrative: this.currentNarrative || undefined,
        recentEvents: this.recentEvents.slice(-5), // Last 5 events for context
      };

      // Check cache
      const hash = this.sceneCache.generateHash(descriptor);
      const cached = this.sceneCache.get(hash);

      if (cached) {
        // Use cached image
        await this.renderer.renderScene(cached.imageData);
        this.ui.addMessage('(cached scene)', '#888');
      } else {
        // Generate new scene
        this.renderer.renderLoading('Generating scene...');
        this.ui.addMessage('The AI DM paints the scene...', '#0ff');

        try {
          // Generate scene with AI enhancement
          const imageData = await this.sceneGen.generateScene(descriptor, this.world, true);

          this.sceneCache.set(hash, imageData, descriptor);
          await this.renderer.renderScene(imageData);
        } catch (error) {
          console.error('Scene generation failed:', error);
          this.renderer.renderPlaceholder(descriptor);
          this.ui.addMessage('Scene generation failed, using placeholder.', '#f80');
        }
      }
    } finally {
      this.isGeneratingScene = false;
    }
  }

  /**
   * Check for random encounters
   */
  private checkForEncounters(): void {
    const roll = Dice.rollPercentile();
    if (roll <= 10) {
      // 10% chance of encounter
      this.triggerEncounter();
    }
  }

  /**
   * Trigger a combat encounter
   */
  private async triggerEncounter(): Promise<void> {
    const monsterTypes = ['goblin', 'orc', 'skeleton', 'zombie'];
    const monsterType = monsterTypes[Dice.roll(monsterTypes.length) - 1];
    const count = Dice.roll(3);

    const monsters: Monster[] = [];
    for (let i = 0; i < count; i++) {
      const template = MONSTER_TEMPLATES[monsterType];
      const monster: Monster = {
        ...template,
        id: crypto.randomUUID(),
        hitPoints: Dice.rollFormula(template.hitDice),
      };
      monsters.push(monster);
    }

    const monsterNames = monsters.map((m) => m.name).join(', ');
    this.ui.addMessage(`ENCOUNTER! ${monsterNames} appear!`, '#f00');

    const narrative = await this.dm.narrateCombatStart(monsters);
    this.ui.addMessage(narrative.narrative, '#fff');
    this.setNarrative(narrative.narrative);
    this.addEvent(`Encountered ${count} ${monsterType}${count > 1 ? 's' : ''}`);

    // Add monsters to world at nearby positions
    const playerPos = this.world.getPlayerPosition();
    for (let i = 0; i < monsters.length; i++) {
      const entity: Entity = {
        id: monsters[i].id,
        type: 'Monster',
        position: { x: playerPos.x + i, y: playerPos.y + 3 },
        data: monsters[i],
      };
      this.world.addEntity(entity);
    }

    // Initiate combat
    this.startCombat(monsters);
  }

  /**
   * Start combat
   */
  private async startCombat(monsters: Monster[]): Promise<void> {
    this.state = GameState.Combat;
    this.currentCombatMonsters = monsters;
    this.ui.addMessage('--- COMBAT BEGINS ---', '#ff0');

    // Initialize turn manager
    this.turnManager = new TurnManager(this.party, monsters);

    // Show initiative order
    this.ui.addMessage(
      'Initiative: ' + this.turnManager.getInitiativeString(),
      '#0ff'
    );

    // Start first turn
    this.processCombatTurn();
  }

  /**
   * Process current combat turn
   */
  private async processCombatTurn(): Promise<void> {
    if (!this.turnManager || !this.turnManager.isActive()) {
      return;
    }

    const combatState = this.turnManager.getState();
    const currentCombatant = this.turnManager.getCurrentCombatant();

    if (!currentCombatant) {
      return;
    }

    // Show round info if new round
    if (combatState.turnIndex === 0) {
      this.ui.addMessage(`\n=== ROUND ${combatState.round} ===`, '#ff0');
    }

    if (currentCombatant.isPlayer) {
      // Player turn - show options
      this.ui.addMessage(`\n${currentCombatant.name}'s turn:`, '#0ff');
      this.ui.addMessage(
        'Actions: [W/Space] Attack | [A] Defend | [D] Flee | [S/I] Item | [M] Spell',
        '#fff'
      );

      // Show available targets
      const aliveMonsters = this.turnManager.getAliveMonsters();
      if (aliveMonsters.length > 0) {
        const targets = aliveMonsters
          .map((m, i) => `${i + 1}. ${m.name} (HP: ${m.hitPoints}/${Dice.rollFormula(m.hitDice)})`)
          .join(', ');
        this.ui.addMessage(`Enemies: ${targets}`, '#f88');
      }
    } else {
      // Enemy turn - process automatically
      this.ui.addMessage(`\n${currentCombatant.name}'s turn:`, '#f88');

      // Small delay for readability
      setTimeout(() => {
        const result = this.turnManager!.processEnemyTurn();
        this.ui.addMessage(result.message, result.color);

        if (this.currentCharacter) {
          this.ui.updateStats(this.currentCharacter);
        }

        if (result.combatEnded) {
          if (result.fled) {
            this.endCombatFled();
          } else {
            this.endCombat(result.victory || false);
          }
        } else {
          // Continue to next turn
          this.processCombatTurn();
        }
      }, 500);
    }
  }

  /**
   * Handle combat action input
   */
  private async handleCombatAction(action: ActionType): Promise<void> {
    if (!this.turnManager || !this.turnManager.isActive()) {
      return;
    }

    const currentCombatant = this.turnManager.getCurrentCombatant();
    if (!currentCombatant || !currentCombatant.isPlayer) {
      return; // Not player's turn
    }

    let playerAction: PlayerAction | null = null;

    // Map keyboard input to combat actions
    // W/Up/Space = Attack, A/Left = Defend, S/Down = Item, D/Right = Flee, M = Spell
    switch (action) {
      case 'MoveNorth': // W or Up - Attack
      case 'Interact': // Space - Attack
        playerAction = 'attack';
        break;
      case 'MoveWest': // A or Left - Defend
        playerAction = 'defend';
        break;
      case 'MoveSouth': // S or Down - Item
      case 'Inventory': // I - Item
        playerAction = 'item';
        break;
      case 'MoveEast': // D or Right - Flee
        playerAction = 'flee';
        break;
      case 'CastSpell': // M - Spell
        playerAction = 'spell';
        break;
    }

    if (playerAction) {
      const result = this.turnManager.processPlayerAction(playerAction);
      this.ui.addMessage(result.message, result.color);

      if (this.currentCharacter) {
        this.ui.updateStats(this.currentCharacter);
      }

      if (result.combatEnded) {
        if (result.fled) {
          this.endCombatFled();
        } else {
          this.endCombat(result.victory || false);
        }
      } else {
        // Continue to next turn
        this.processCombatTurn();
      }
    }
  }

  /**
   * End combat when player flees
   */
  private endCombatFled(): void {
    if (this.turnManager) {
      this.turnManager.endCombat();
      this.turnManager = null;
    }

    this.ui.addMessage('--- ESCAPED! ---', '#ff0');
    this.state = GameState.Exploring;
    this.currentCombatMonsters = [];
  }

  /**
   * End combat
   */
  private endCombat(victory: boolean): void {
    if (this.turnManager) {
      this.turnManager.endCombat();
      this.turnManager = null;
    }

    if (victory) {
      this.ui.addMessage('--- VICTORY! ---', '#ff0');

      // Remove dead monsters from world
      for (const monster of this.currentCombatMonsters) {
        if (monster.hitPoints <= 0) {
          this.world.removeEntity(monster.id);
        }
      }

      // Check for level up
      if (this.currentCharacter && CharacterBuilder.canLevelUp(this.currentCharacter)) {
        CharacterBuilder.levelUp(this.currentCharacter);
        this.ui.addMessage(`${this.currentCharacter.name} gains a level!`, '#ff0');
        this.ui.updateStats(this.currentCharacter);
      }

      this.state = GameState.Exploring;
    } else {
      this.ui.addMessage('--- DEFEAT! ---', '#f00');
      this.state = GameState.GameOver;
    }

    this.currentCombatMonsters = [];
  }

  /**
   * Handle interact action
   */
  private async handleInteract(): Promise<void> {
    const pos = this.world.getPlayerPosition();

    // Check for NPCs nearby (within 1 tile)
    const nearbyNPCs = this.npcManager.getNPCsAt(pos.x, pos.y, 1);

    if (nearbyNPCs.length > 0) {
      // Interact with the first NPC
      const npc = nearbyNPCs[0];
      await this.startDialogue(npc.id);
      return;
    }

    // Check for entities at current position
    const entities = this.world.getEntitiesAt(pos);

    if (entities.length > 0) {
      const entity = entities[0];
      if (entity.type === 'NPC') {
        const npcData = entity.data as NPC;
        if (npcData.hasAgent && npcData.agentId) {
          await this.startDialogue(npcData.agentId);
        } else {
          this.ui.addMessage(`You speak with ${npcData.name}.`);
        }
      } else {
        this.ui.addMessage(`You interact with ${(entity.data as any).name}`);
      }
    } else {
      this.ui.addMessage('There is nothing here to interact with.');
    }
  }

  /**
   * Start dialogue with an NPC
   */
  private async startDialogue(npcId: string): Promise<void> {
    const npc = this.npcManager.getNPC(npcId);
    if (!npc) {
      this.ui.addMessage('NPC not found.', '#f00');
      return;
    }

    this.currentDialogueNPC = npcId;
    this.state = GameState.Dialogue;

    this.ui.addMessage(`\n--- Talking to ${npc.name} ---`, '#ff0');
    this.ui.addMessage(`(${npc.description})`, '#888');

    // Initial greeting from NPC
    const greeting = await this.npcManager.handleDialogue(
      npcId,
      this.currentCharacter?.name || 'Adventurer',
      'Hello',
      `The party approaches ${npc.name} in the dungeon.`
    );

    this.ui.addMessage(`${npc.name}: "${greeting}"`, '#0ff');

    // Show dialogue options
    this.ui.showDialog(
      `Conversation with ${npc.name}`,
      `What would you like to say?`,
      [
        {
          text: 'Ask about the dungeon',
          callback: () => this.continueDialogue(npcId, 'What can you tell me about this place?'),
        },
        {
          text: 'Ask about quests',
          callback: () => this.continueDialogue(npcId, 'Do you need any help?'),
        },
        {
          text: 'Trade',
          callback: () => this.continueDialogue(npcId, 'Do you have anything to trade?'),
        },
        {
          text: 'Farewell',
          callback: () => this.endDialogue(),
        },
      ]
    );
  }

  /**
   * Continue dialogue with an NPC
   */
  private async continueDialogue(npcId: string, message: string): Promise<void> {
    const npc = this.npcManager.getNPC(npcId);
    if (!npc) return;

    this.ui.addMessage(`You: "${message}"`, '#fff');

    const response = await this.npcManager.handleDialogue(
      npcId,
      this.currentCharacter?.name || 'Adventurer',
      message,
      `In the dungeon, discussing various topics.`
    );

    this.ui.addMessage(`${npc.name}: "${response}"`, '#0ff');

    // Show more dialogue options
    this.ui.showDialog(
      `Conversation with ${npc.name}`,
      `Continue conversation?`,
      [
        {
          text: 'Ask about the dungeon',
          callback: () => this.continueDialogue(npcId, 'What can you tell me about this place?'),
        },
        {
          text: 'Ask about quests',
          callback: () => this.continueDialogue(npcId, 'Do you need any help?'),
        },
        {
          text: 'Ask about rumors',
          callback: () => this.continueDialogue(npcId, 'Have you heard any interesting rumors?'),
        },
        {
          text: 'Farewell',
          callback: () => this.endDialogue(),
        },
      ]
    );
  }

  /**
   * End dialogue with an NPC
   */
  private endDialogue(): void {
    if (this.currentDialogueNPC) {
      const npc = this.npcManager.getNPC(this.currentDialogueNPC);
      if (npc) {
        this.ui.addMessage(`You say farewell to ${npc.name}.`, '#888');
      }
      this.currentDialogueNPC = null;
    }
    this.state = GameState.Exploring;
  }

  /**
   * Show character sheet
   */
  private showCharacterSheet(): void {
    if (this.currentCharacter) {
      this.ui.showDialog(
        'Character Sheet',
        `<pre>${JSON.stringify(this.currentCharacter, null, 2)}</pre>`,
        [{ text: 'Close', callback: () => {} }]
      );
    }
  }

  /**
   * Handle rest
   */
  private handleRest(): void {
    if (!this.currentCharacter) return;

    this.ui.addMessage('You rest for 8 hours...', '#0ff');
    this.currentCharacter.combat.hitPoints = this.currentCharacter.combat.maxHitPoints;
    this.world.advanceTime(480); // 8 hours
    this.ui.updateStats(this.currentCharacter);
    this.ui.addMessage('You feel refreshed!', '#0f0');
  }

  /**
   * Spawn random monsters in dungeon
   */
  private spawnMonsters(count: number): void {
    const monsterTypes = ['goblin', 'orc', 'skeleton', 'zombie'];

    for (let i = 0; i < count; i++) {
      const monsterType = monsterTypes[Dice.roll(monsterTypes.length) - 1];
      const template = MONSTER_TEMPLATES[monsterType];

      const monster: Monster = {
        ...template,
        id: crypto.randomUUID(),
        hitPoints: Dice.rollFormula(template.hitDice),
      };

      // Find random floor position
      const x = Dice.roll(40) + 5;
      const y = Dice.roll(40) + 5;

      const entity: Entity = {
        id: monster.id,
        type: 'Monster',
        position: { x, y },
        data: monster,
      };

      this.world.addEntity(entity);
    }
  }

  /**
   * Spawn AI-controlled NPCs in dungeon
   */
  private spawnNPCs(count: number): void {
    for (let i = 0; i < count; i++) {
      // Find random floor position
      const x = Dice.roll(40) + 5;
      const y = Dice.roll(40) + 5;

      // Create NPC with AI agent
      const managedNPC = this.npcManager.createRandomNPC(
        crypto.randomUUID(),
        { x, y }
      );

      // Create NPC data for world entity
      const npcData: NPC = {
        id: managedNPC.id,
        name: managedNPC.name,
        description: managedNPC.description,
        dialogue: [],
        hostile: managedNPC.alignment.includes('Evil'),
        questGiver: managedNPC.persona.questPotential,
        archetype: managedNPC.archetype,
        alignment: managedNPC.alignment,
        hasAgent: true,
        agentId: managedNPC.id,
      };

      // Add to world
      const entity: Entity = {
        id: managedNPC.id,
        type: 'NPC',
        position: { x, y },
        data: npcData,
      };

      this.world.addEntity(entity);

      this.ui.addMessage(
        `${managedNPC.name} (${managedNPC.archetype}) appears at (${x}, ${y})`,
        '#0ff'
      );
    }
  }

  /**
   * Set the current narrative context
   */
  private setNarrative(narrative: string): void {
    this.currentNarrative = narrative;
  }

  /**
   * Add an event to recent events (for scene generation context)
   */
  private addEvent(event: string): void {
    this.recentEvents.push(event);
    // Keep only the last 10 events
    if (this.recentEvents.length > 10) {
      this.recentEvents.shift();
    }
  }

  /**
   * Clear current narrative (for future use)
   */
  // private clearNarrative(): void {
  //   this.currentNarrative = null;
  // }

  /**
   * Update the minimap display
   */
  private updateMinimap(): void {
    this.minimap.render(this.world);
  }
}
