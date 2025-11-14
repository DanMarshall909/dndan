# Development Guide

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Anthropic API key (Claude)
- Stable Diffusion API access (optional, uses placeholders otherwise)

### Initial Setup

1. **Clone and install**:
```bash
git clone <repository-url>
cd dndan
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **Run development servers**:
```bash
# Terminal 1: Frontend (Vite)
npm run dev

# Terminal 2: Backend (Express)
npm run server
```

4. **Open browser**:
```
http://localhost:3000
```

## Project Structure

```
dndan/
├── src/
│   ├── game/              # Core game mechanics
│   │   ├── types.ts       # Type definitions
│   │   ├── dice.ts        # Dice rolling
│   │   ├── character.ts   # Character system
│   │   ├── combat.ts      # THAC0 combat
│   │   ├── data.ts        # Game data (monsters, items)
│   │   └── engine.ts      # Main game engine
│   ├── map/               # World state
│   │   ├── types.ts       # Map types
│   │   ├── world.ts       # Tile map & entities
│   │   └── generator.ts   # Dungeon generation
│   ├── ai/                # AI integration
│   │   ├── dm.ts          # Claude DM
│   │   ├── scene-gen.ts   # Stable Diffusion
│   │   └── cache.ts       # Image caching
│   ├── render/            # Graphics
│   │   ├── renderer.ts    # Canvas renderer
│   │   └── ui.ts          # UI panels
│   ├── input/             # Controls
│   │   └── controls.ts    # Keyboard handler
│   ├── server/            # Backend
│   │   └── index.ts       # Express server
│   └── main.ts            # Entry point
├── docs/                  # Documentation
├── public/                # Static assets
├── dist/                  # Build output
└── package.json
```

## Development Workflow

### Adding a New Monster

1. Add template to `src/game/data.ts`:
```typescript
export const MONSTER_TEMPLATES: Record<string, Omit<Monster, 'id' | 'hitPoints'>> = {
  // ...existing monsters...
  newMonster: {
    name: 'New Monster',
    hitDice: '3d8',
    armorClass: 5,
    thac0: 18,
    attacks: [{ name: 'Claw', damage: '1d6' }],
    movement: 12,
    morale: 10,
    xpValue: 120,
    specialAbilities: ['Night Vision'],
    description: 'A fearsome creature...',
  },
};
```

2. Use in encounters:
```typescript
const monster = MONSTER_TEMPLATES.newMonster;
```

### Adding a New Character Class

1. Define class info in `src/game/character.ts`:
```typescript
export const CLASSES: Record<CharacterClass, ClassInfo> = {
  // ...existing classes...
  Barbarian: {
    name: 'Barbarian',
    hitDie: 12,
    baseTHAC0: 20,
    thac0Progression: 1,
    savingThrows: { /* ... */ },
    allowedArmor: ['None', 'Leather'],
    allowedWeapons: ['Sword', 'Axe', 'Mace'],
    spellcaster: false,
  },
};
```

2. Add to type definition in `src/game/types.ts`:
```typescript
export type CharacterClass =
  | 'Fighter'
  | 'Ranger'
  // ...
  | 'Barbarian';
```

### Modifying Scene Generation

Edit `src/ai/scene-gen.ts`:

```typescript
buildPrompt(descriptor: SceneDescriptor, world: World): string {
  // Customize prompt generation logic
  // Add new environmental details
  // Modify style parameters
}
```

### Customizing Combat

Edit `src/game/combat.ts`:

```typescript
static characterAttack(
  character: Character,
  target: Monster,
  weapon: Weapon | null
): AttackResult {
  // Modify attack calculations
  // Add special weapon effects
  // Implement critical hit variants
}
```

### Adding UI Elements

Edit `src/render/ui.ts`:

```typescript
export class GameUI {
  // Add new panel
  private createCustomPanel(): HTMLElement {
    const panel = document.createElement('div');
    // Configure panel
    return panel;
  }

  // Add new method
  updateCustomPanel(data: any): void {
    // Update panel content
  }
}
```

## Testing

### Manual Testing Checklist

- [ ] Character creation and stats display
- [ ] Movement in all 4 directions
- [ ] Rotation (left/right)
- [ ] Scene caching (second visit to location should be instant)
- [ ] Combat initiation and resolution
- [ ] Damage calculation and HP updates
- [ ] Experience gain and leveling
- [ ] AI DM narrative generation
- [ ] Message log scrolling
- [ ] Keyboard controls responsiveness

### Testing Combat Mechanics

```typescript
// In browser console
const char = game.party[0];
const modifiers = CharacterBuilder.calculateAbilityModifiers(char.abilities);
console.log('Modifiers:', modifiers);

// Test attack roll
const goblin = MONSTER_TEMPLATES.goblin;
const testGoblin = { ...goblin, id: '123', hitPoints: 8 };
const result = CombatEngine.characterAttack(char, testGoblin, char.equipment.weapon);
console.log('Attack result:', result);
```

### Testing Dungeon Generation

```typescript
const generator = new DungeonGenerator();
const dungeon = generator.generateDungeon(30, 30, 1);
console.log('Rooms:', dungeon.rooms);
console.log('Room count:', dungeon.rooms.length);
```

## Debugging

### Enable Verbose Logging

Add to `src/game/engine.ts`:

```typescript
private DEBUG = true;

private log(message: string, data?: any): void {
  if (this.DEBUG) {
    console.log(`[GameEngine] ${message}`, data || '');
  }
}
```

### Inspect World State

In browser console:
```javascript
// Access game instance (expose in window for debugging)
window.gameInstance = game;

// Inspect world
console.log(game.world.getState());
console.log(game.world.getPlayerPosition());
console.log(game.world.getPlayerFacing());

// Inspect entities
for (const [id, entity] of game.world.getState().entities) {
  console.log(entity);
}

// Inspect cache
console.log(game.sceneCache.getStats());
```

### View Scene Cache

```typescript
// Export cache to JSON
const cacheData = sceneCache.toJSON();
console.log('Cache entries:', Object.keys(cacheData).length);
console.log('Cache data:', cacheData);

// View specific cache entry
const hash = sceneCache.generateHash(descriptor);
const entry = sceneCache.get(hash);
console.log('Cache entry:', entry);
```

## Performance Optimization

### Scene Generation

- **Cache hits**: Should be < 50ms
- **Cache misses**: 3-8 seconds (SD generation)
- **Reduce generation time**:
  - Lower `steps` parameter (20 instead of 30)
  - Use faster SD model (SD 1.5 instead of SDXL)
  - Implement progressive loading

### Memory Management

Monitor cache size:
```typescript
const stats = sceneCache.getStats();
console.log(`Cache: ${stats.size}/${stats.maxSize} (${stats.utilization.toFixed(1)}%)`);
```

Adjust cache size:
```typescript
const cache = new SceneCache(1000); // Increase to 1000 entries
```

### Frame Rate

The game uses `requestAnimationFrame` for the main loop. Monitor performance:

```typescript
let lastTime = 0;
let frameCount = 0;

function gameLoop(currentTime: number): void {
  frameCount++;
  if (currentTime - lastTime >= 1000) {
    console.log(`FPS: ${frameCount}`);
    frameCount = 0;
    lastTime = currentTime;
  }
  // ... rest of game loop
}
```

## Building for Production

### Build the project

```bash
npm run build
```

Output will be in `dist/`:
- `dist/index.html` - Entry HTML
- `dist/assets/` - Bundled JS/CSS

### Deploy

#### Static Hosting (Vercel, Netlify)

```bash
# Build
npm run build

# Deploy dist/ directory
# Configure environment variables in hosting platform
```

#### Self-Hosted

```bash
# Build
npm run build

# Serve with any static server
npx serve dist

# Or with nginx
# Copy dist/ to /var/www/dndan
```

### Environment Variables in Production

Set these in your hosting platform:
- `VITE_ANTHROPIC_API_KEY`
- `VITE_SD_API_URL`
- `VITE_SD_API_KEY`

## Common Issues

### "Failed to initialize game"

- Check API keys in `.env`
- Verify backend server is running
- Check browser console for errors

### Scene generation stuck

- Check SD API connectivity
- Verify API key validity
- Check server logs for errors
- Fallback to placeholder mode

### Combat not working

- Verify monster data is loaded
- Check character equipment
- Review combat log in UI
- Inspect CombatEngine results in console

### Movement blocked

- Check tile type at position
- Verify dungeon generation created floors
- Inspect world state tiles
- Check for blocking entities

## Code Style

### TypeScript

- Use strict mode
- Explicit return types for public methods
- Prefer interfaces over types for object shapes
- Use enums for fixed sets of values

### Naming Conventions

- Classes: `PascalCase`
- Functions/methods: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Interfaces: `PascalCase` (no `I` prefix)
- Types: `PascalCase`

### Comments

```typescript
/**
 * JSDoc for public APIs
 * @param character The character performing the attack
 * @returns The attack result with damage and hit status
 */
public attackMonster(character: Character): AttackResult {
  // Inline comments for complex logic
  const roll = Dice.roll(20);

  // ... implementation
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-spell-system`
3. Make changes with clear commits
4. Test thoroughly
5. Submit pull request with description

## Resources

- [AD&D 2nd Edition Player's Handbook](https://en.wikipedia.org/wiki/Player%27s_Handbook)
- [Pool of Radiance](https://en.wikipedia.org/wiki/Pool_of_Radiance) - Inspiration
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference)
- [Stable Diffusion](https://github.com/Stability-AI/stablediffusion)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
