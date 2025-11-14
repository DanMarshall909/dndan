/**
 * Main game engine - orchestrates all systems
 */

import { World } from '../map/world';
import { DungeonGenerator } from '../map/generator';
import { Character, Monster } from './types';
import { CharacterBuilder } from './character';
import { CombatEngine } from './combat';
import { AIDungeonMaster } from '../ai/dm';
import { SceneCache } from '../ai/cache';
import { SceneGenerator } from '../ai/scene-gen';
import { Renderer } from '../render/renderer';
import { GameUI } from '../render/ui';
import { InputController, ActionType } from '../input/controls';
import { SceneDescriptor, Entity } from '../map/types';
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
  private sceneCache: SceneCache;
  private sceneGen: SceneGenerator;
  private renderer: Renderer;
  private ui: GameUI;
  private input: InputController;
  private isGeneratingScene: boolean;

  constructor(
    canvas: HTMLCanvasElement,
    uiContainerId: string,
    claudeApiKey: string,
    sdApiUrl: string,
    sdApiKey: string
  ) {
    this.world = new World();
    this.party = [];
    this.currentCharacter = null;
    this.state = GameState.Initializing;
    this.isGeneratingScene = false;

    // Initialize AI systems
    this.dm = new AIDungeonMaster(claudeApiKey);
    this.sceneCache = new SceneCache(500);
    this.sceneGen = new SceneGenerator(sdApiUrl, sdApiKey);

    // Initialize rendering
    this.renderer = new Renderer(canvas, 160, 100, 2);
    this.ui = new GameUI(uiContainerId);

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

    // Initialize adventure with AI DM
    this.ui.addMessage('The Dungeon Master prepares your adventure...', '#ff0');
    const intro = await this.dm.initializeAdventure(this.party);
    this.ui.addMessage(intro.narrative, '#fff');

    // Update UI
    this.ui.updateStats(character);
    this.ui.showControls();

    // Render initial scene
    await this.renderCurrentScene();

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
    if (this.state !== GameState.Exploring) return;

    const direction = InputController.actionToDirection(action);
    if (direction) {
      // Movement
      const moved = this.world.movePlayer(direction);
      if (moved) {
        this.ui.addMessage(`You move ${direction.toLowerCase()}.`);
        await this.renderCurrentScene();

        // Check for encounters
        this.checkForEncounters();
      } else {
        this.ui.addMessage('Your path is blocked.', '#f00');
      }
    } else if (action === 'RotateLeft') {
      this.world.rotatePlayer(false);
      this.ui.addMessage('You turn left.');
      await this.renderCurrentScene();
    } else if (action === 'RotateRight') {
      this.world.rotatePlayer(true);
      this.ui.addMessage('You turn right.');
      await this.renderCurrentScene();
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
          // For now, use placeholder instead of actual SD generation
          // const imageData = await this.sceneGen.generateScene(descriptor, this.world);
          const imageData = this.sceneGen.generatePlaceholder(descriptor);

          this.sceneCache.set(hash, imageData, descriptor);
          await this.renderer.renderScene(imageData);
        } catch (error) {
          console.error('Scene generation failed:', error);
          this.renderer.renderPlaceholder(descriptor);
          this.ui.addMessage('Using placeholder scene.', '#f80');
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
    this.ui.addMessage('--- COMBAT BEGINS ---', '#ff0');

    // Roll initiative
    const initiative = CombatEngine.rollInitiative(this.party, monsters);
    this.ui.addMessage(
      'Initiative: ' + initiative.map((i) => `${i.name}(${i.initiative})`).join(', ')
    );

    // Combat loop (simplified - just one round for demo)
    for (const combatant of initiative) {
      if (combatant.isPlayer) {
        // Player turn
        const character = this.party.find((c) => c.id === combatant.id);
        const target = monsters[0];

        if (character && target && target.hitPoints > 0) {
          const result = CombatEngine.characterAttack(character, target, character.equipment.weapon);
          const desc = CombatEngine.describeAttackResult(result, character.name, target.name);
          this.ui.addMessage(desc, result.hit ? '#0f0' : '#888');

          if (result.hit) {
            const dead = CombatEngine.damageMonster(target, result.damage);
            if (dead) {
              this.ui.addMessage(`${target.name} is slain!`, '#ff0');
              character.experience += target.xpValue;
              this.world.removeEntity(target.id);
            }
          }
        }
      } else {
        // Monster turn
        const monster = monsters.find((m) => m.id === combatant.id);
        const target = this.party[0];

        if (monster && monster.hitPoints > 0 && target) {
          const result = CombatEngine.monsterAttack(monster, target);
          const desc = CombatEngine.describeAttackResult(result, monster.name, target.name);
          this.ui.addMessage(desc, result.hit ? '#f00' : '#888');

          if (result.hit) {
            const dead = CombatEngine.damageCharacter(target, result.damage);
            this.ui.updateStats(target);

            if (dead) {
              this.ui.addMessage(`${target.name} has fallen!`, '#f00');
              this.state = GameState.GameOver;
              return;
            }
          }
        }
      }
    }

    // Check if all monsters defeated
    const aliveMonsters = monsters.filter((m) => m.hitPoints > 0);
    if (aliveMonsters.length === 0) {
      this.ui.addMessage('--- VICTORY! ---', '#ff0');
      this.state = GameState.Exploring;

      // Check for level up
      if (this.currentCharacter && CharacterBuilder.canLevelUp(this.currentCharacter)) {
        CharacterBuilder.levelUp(this.currentCharacter);
        this.ui.addMessage(`${this.currentCharacter.name} gains a level!`, '#ff0');
        this.ui.updateStats(this.currentCharacter);
      }
    }
  }

  /**
   * Handle interact action
   */
  private handleInteract(): void {
    const pos = this.world.getPlayerPosition();
    const entities = this.world.getEntitiesAt(pos);

    if (entities.length > 0) {
      const entity = entities[0];
      this.ui.addMessage(`You interact with ${(entity.data as any).name}`);
    } else {
      this.ui.addMessage('There is nothing here to interact with.');
    }
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
}
