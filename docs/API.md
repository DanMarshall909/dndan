# D&D AN - API Documentation

## Game Engine API

### `GameEngine`

The main game orchestrator that manages all systems.

```typescript
constructor(
  canvas: HTMLCanvasElement,
  uiContainerId: string,
  claudeApiKey: string,
  sdApiUrl: string,
  sdApiKey: string
)
```

**Methods:**

- `initializeGame(): Promise<void>` - Initialize a new game session
- `renderCurrentScene(): Promise<void>` - Render the current view with caching
- `handleAction(action: ActionType): Promise<void>` - Process player actions

## World Management

### `World`

Manages the tile-based map and entity system.

```typescript
// Tile operations
getTile(pos: Position): Tile | undefined
setTile(pos: Position, tile: Tile): void
isTileBlocking(pos: Position): boolean

// Entity operations
getEntity(id: string): Entity | undefined
getEntitiesAt(pos: Position): Entity[]
addEntity(entity: Entity): void
removeEntity(id: string): void

// Player operations
getPlayerPosition(): Position
getPlayerFacing(): Direction
movePlayer(direction: Direction): boolean
rotatePlayer(clockwise: boolean): void

// Vision
getVisibleTiles(radius: number): Position[]
hasLineOfSight(from: Position, to: Position): boolean
```

## Character System

### `CharacterBuilder`

AD&D 1st/2nd Edition character creation and management.

```typescript
// Creation
static rollAbilities(): AbilityScores
static createCharacter(
  name: string,
  race: Race,
  charClass: CharacterClass,
  alignment: Alignment,
  abilities?: AbilityScores
): Character

// Leveling
static levelUp(character: Character): void
static canLevelUp(character: Character): boolean

// Modifiers
static calculateAbilityModifiers(abilities: AbilityScores): AbilityModifiers
```

## Combat System

### `CombatEngine`

THAC0-based combat mechanics.

```typescript
// Initiative
static rollInitiative(
  playerParty: Character[],
  monsters: Monster[]
): CombatantInitiative[]

// Attacks
static characterAttack(
  character: Character,
  target: Monster,
  weapon: Weapon | null
): AttackResult

static monsterAttack(
  monster: Monster,
  target: Character,
  attackIndex?: number
): AttackResult

// Damage
static damageCharacter(character: Character, damage: number): boolean
static damageMonster(monster: Monster, damage: number): boolean

// Saving Throws
static savingThrow(
  character: Character,
  saveType: keyof SavingThrows,
  modifier?: number
): SavingThrowResult
```

## AI Systems

### `AIDungeonMaster`

Claude-powered narrative generation.

```typescript
// Initialization
constructor(apiKey: string)

// Narrative
async initializeAdventure(party: Character[]): Promise<DMResponse>
async describeLocation(description: string, entities: string[]): Promise<DMResponse>

// Combat
async narrateCombatStart(monsters: Monster[]): Promise<DMResponse>
async narrateCombatAction(
  attackerName: string,
  targetName: string,
  result: AttackResult,
  isPlayerAttack: boolean
): Promise<DMResponse>

// Interaction
async generateNPCDialogue(
  npcName: string,
  npcDescription: string,
  context: string
): Promise<DMResponse>

async generateQuest(location: string, partyLevel: number): Promise<DMResponse>
```

### `SceneGenerator`

Stable Diffusion scene generation.

```typescript
constructor(apiUrl: string, apiKey: string)

// Prompt building
buildPrompt(descriptor: SceneDescriptor, world: World): string
buildNegativePrompt(): string

// Generation
async generateScene(descriptor: SceneDescriptor, world: World): Promise<string>
generatePlaceholder(descriptor: SceneDescriptor): string
```

### `SceneCache`

LRU cache for generated images.

```typescript
constructor(maxCacheSize: number = 500)

generateHash(descriptor: SceneDescriptor): string
has(hash: string): boolean
get(hash: string): CacheEntry | undefined
set(hash: string, imageData: string, descriptor: SceneDescriptor): void

// Persistence
toJSON(): Record<string, CacheEntry>
fromJSON(data: Record<string, CacheEntry>): void
```

## Rendering

### `Renderer`

Canvas-based pixel art renderer.

```typescript
constructor(
  canvas: HTMLCanvasElement,
  width: number = 160,
  height: number = 100,
  scale: number = 2
)

async renderScene(imageData: string): Promise<void>
renderLoading(message?: string): void
renderPlaceholder(descriptor: SceneDescriptor): void
clear(): void
```

### `GameUI`

UI panel management.

```typescript
constructor(containerId: string)

addMessage(message: string, color?: string): void
updateStats(character: Character): void
showControls(): void
clearLog(): void
showDialog(
  title: string,
  content: string,
  buttons: { text: string; callback: () => void }[]
): void
```

## Input Handling

### `InputController`

Keyboard input processing.

```typescript
constructor()

getNextAction(): GameAction | null
hasPendingActions(): boolean
clearActions(): void
setEnabled(enabled: boolean): void

static actionToDirection(action: ActionType): Direction | null
```

## Dungeon Generation

### `DungeonGenerator`

BSP-based dungeon creation.

```typescript
generateDungeon(width: number, height: number, level: number): Dungeon
applyToWorld(dungeon: Dungeon, world: World): void
```

## Server API

### Health Check

```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-14T12:00:00.000Z"
}
```

### Scene Generation

```
POST /api/generate
```

Request:
```json
{
  "prompt": "160x100 pixel art, dungeon corridor...",
  "negativePrompt": "blurry, 3d, realistic...",
  "width": 160,
  "height": 100,
  "steps": 25,
  "cfgScale": 7.5
}
```

Response:
```json
{
  "image": "data:image/png;base64,...",
  "prompt": "...",
  "generated": "2025-01-14T12:00:00.000Z"
}
```

## Type Definitions

### Core Types

```typescript
// Position & Direction
type Direction = 'North' | 'East' | 'South' | 'West';
interface Position { x: number; y: number; }
interface ViewState { position: Position; facing: Direction; }

// Tiles
type TileType = 'Floor' | 'Wall' | 'Door' | 'LockedDoor' | 'SecretDoor' | 'Stairs' | 'Pit' | 'Water' | 'Chest';
interface Tile {
  type: TileType;
  blocking: boolean;
  opaque: boolean;
  discovered: boolean;
  description?: string;
}

// Entities
type EntityType = 'Monster' | 'NPC' | 'Item';
interface Entity {
  id: string;
  type: EntityType;
  position: Position;
  data: Monster | NPC | Item;
}

// Characters
type CharacterClass = 'Fighter' | 'Ranger' | 'Paladin' | 'Cleric' | 'Magic-User' | 'Thief';
type Race = 'Human' | 'Elf' | 'Dwarf' | 'Halfling' | 'Half-Elf';
type Alignment = 'Lawful Good' | 'Neutral Good' | 'Chaotic Good' | ...;

interface Character {
  id: string;
  name: string;
  race: Race;
  class: CharacterClass;
  level: number;
  alignment: Alignment;
  abilities: AbilityScores;
  combat: CombatStats;
  saves: SavingThrows;
  experience: number;
  nextLevelXP: number;
  equipment: Equipment;
  spells?: SpellData;
  conditions: StatusCondition[];
}

// Monsters
interface Monster {
  id: string;
  name: string;
  hitDice: string;
  hitPoints: number;
  armorClass: number;
  thac0: number;
  attacks: MonsterAttack[];
  movement: number;
  morale: number;
  xpValue: number;
  specialAbilities: string[];
  description: string;
}
```

## Event Flow

### Game Initialization

1. `GameEngine.constructor()` - Create engine instance
2. `initializeGame()` - Setup game state
3. Character creation via `CharacterBuilder`
4. Dungeon generation via `DungeonGenerator`
5. `AIDungeonMaster.initializeAdventure()` - Get intro narrative
6. `renderCurrentScene()` - Display first scene
7. `gameLoop()` - Start game loop

### Player Action Flow

1. User presses key → `InputController` queues action
2. `gameLoop()` retrieves action from queue
3. `handleAction()` processes action type
4. World state updates (movement, rotation, etc.)
5. `renderCurrentScene()` triggered
6. Scene hash calculated
7. Cache checked → hit: instant display, miss: generate
8. AI DM narrates results
9. UI updated with messages and stats

### Combat Flow

1. Random encounter check or triggered event
2. `AIDungeonMaster.narrateCombatStart()`
3. `CombatEngine.rollInitiative()`
4. For each combatant in turn order:
   - Player: `characterAttack()` or spell
   - Monster: `monsterAttack()`
   - Apply damage, check for death
   - AI narration of results
5. Check victory/defeat conditions
6. Award XP, check level up
7. Return to exploration

## Data Files

### `src/game/data.ts`

Contains game data:
- `WEAPONS` - Weapon definitions
- `ARMOR` - Armor definitions
- `MONSTER_TEMPLATES` - Monster stat blocks
- `ITEM_TEMPLATES` - Item definitions

### `src/game/character.ts`

Contains AD&D data:
- `RACES` - Race information and modifiers
- `CLASSES` - Class information (hit dice, THAC0, saves)
- `XP_TABLES` - Experience requirements per level

## Environment Variables

Required:
- `VITE_ANTHROPIC_API_KEY` - Claude API key for AI DM

Optional:
- `VITE_SD_API_URL` - Stable Diffusion API endpoint
- `VITE_SD_API_KEY` - SD API authentication key
