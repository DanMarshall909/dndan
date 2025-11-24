# D&D AN - AI-Powered D&D Roguelike

An old-school Advanced Dungeons & Dragons roguelike game where an AI acts as the Dungeon Master, generating pixel art scenes in real-time while maintaining a consistent world through traditional tile-based mapping.

## Overview

D&D AN combines classic AD&D 1st/2nd Edition rules with modern AI technology to create a unique roguelike experience:

- **AI Dungeon Master**: Claude AI generates dynamic narratives, encounters, and storylines
- **LangChain NPC Agents**: 12 distinct AI-controlled characters with memory, personalities, and autonomous behavior
- **Multi-Provider Image Generation**: Support for OpenAI DALL-E, Replicate, and Stability AI
- **Pixel Art Generation**: AI creates 160x100 pixel art scenes for each frame
- **Scene Caching**: Identical views (position + orientation) reuse cached images for performance
- **Traditional Mechanics**: THAC0, saving throws, Vancian magic, and authentic AD&D calculations
- **Grid-Based Movement**: Move one tile at a time, rotate 90 degrees
- **Retro Aesthetic**: 256-color palette, low-resolution graphics inspired by Pool of Radiance

## Technical Architecture

### World State Management
- **Tile-Based Map**: Traditional 2D grid tracking walls, floors, doors, traps
- **Entity System**: NPCs, monsters, and items stored with (x, y) coordinates
- **Consistent World**: The dungeon layout remains constant; only the visual representation is AI-generated

### Scene Generation Pipeline
1. **Player Action**: Move/rotate triggers new frame
2. **View State Hash**: Generate key from (x, y, facing, visible entities, lighting)
3. **Cache Lookup**: Check if this exact view was previously generated
4. **Generate or Load**: Either fetch cached image or generate new pixel art via Stable Diffusion
5. **Render**: Display 160x100 image scaled to 320x200 viewport

### AI Integration
- **Claude (DM)**: Story generation, combat narration, NPC dialogue, quest creation
- **Claude (Scene Prompts)**: Enhances image prompts by combining game state, map layout, and narrative context
- **LangChain NPCs**: Autonomous AI agents controlling world characters with:
  - Individual personalities from 12 archetypes (Merchant, Guard, Hermit, etc.)
  - Memory systems tracking past conversations and relationships
  - Context-aware decision making and dialogue
  - Dynamic relationship levels (Hostile → Allied)
- **Multi-Provider Image Generation**: Support for OpenAI DALL-E, Replicate, and Stability AI
- **Narrative-Driven Visuals**: Generated images reflect the current story, recent events, and DM narration
- **Caching Strategy**: Reduces API costs and ensures instant response for explored areas

## Game Features

### Character System (AD&D 1st/2nd Ed)
- **Ability Scores**: STR, INT, WIS, DEX, CON, CHA (3d6 rolls)
- **Races**: Human, Elf, Dwarf, Halfling, Half-Elf
- **Classes**: Fighter, Cleric, Magic-User, Thief, Ranger, Paladin
- **Alignment**: Lawful/Neutral/Chaotic Good/Neutral/Evil

### Combat Mechanics
- **THAC0 System**: "To Hit Armor Class 0" attack calculations
- **Initiative**: Dexterity-based turn order
- **Damage Rolls**: Weapon-specific dice (1d8 longsword, 1d4 dagger, etc.)
- **Saving Throws**: Five categories (Death Magic, Wands, Paralysis, Breath Weapon, Spells)
- **Critical Hits**: Natural 20 rules

### Magic System
- **Vancian Casting**: Spells must be memorized before use
- **Spell Slots**: Limited by class and level
- **Spell Recovery**: Requires 8-hour rest
- **Spell Lists**: Cleric spells (divine) and Magic-User spells (arcane)

### Movement & Exploration
- **Grid-Based**: Move one tile in cardinal directions (N/S/E/W)
- **Rotation**: Turn 90 degrees left/right
- **Fog of War**: Unexplored areas remain hidden
- **Line of Sight**: Walls block vision; torches provide light radius

## Project Structure

```
dndan/
├── src/
│   ├── game/              # Core game logic
│   │   ├── character.ts   # Character creation, stats, leveling
│   │   ├── combat.ts      # THAC0, attack rolls, damage
│   │   ├── spells.ts      # Spell definitions and effects
│   │   ├── items.ts       # Equipment, weapons, armor
│   │   └── dice.ts        # Dice rolling utilities
│   ├── map/               # World state management
│   │   ├── world.ts       # Tile map, entity storage
│   │   ├── generator.ts   # Dungeon generation algorithms
│   │   └── entities.ts    # NPCs, monsters, objects
│   ├── ai/                # AI integration
│   │   ├── dm.ts          # Claude DM integration
│   │   ├── npc-agent.ts   # LangChain NPC agents
│   │   ├── npc-manager.ts # NPC coordination system
│   │   ├── npc-personas.ts # NPC personality templates
│   │   ├── scene-gen.ts   # Stable Diffusion client
│   │   └── cache.ts       # Image caching system
│   ├── render/            # Graphics rendering
│   │   ├── renderer.ts    # Canvas management
│   │   ├── ui.ts          # UI panels and overlays
│   │   └── palette.ts     # 256-color palette
│   ├── input/             # Player controls
│   │   └── controls.ts    # Keyboard/mouse handling
│   ├── server/            # Backend API
│   │   └── index.ts       # Express server for AI endpoints
│   └── main.ts            # Application entry point
├── docs/                  # Documentation
│   ├── GAME_DESIGN.md
│   ├── DEVELOPMENT.md
│   ├── API.md
│   └── NPC_AGENT_SYSTEM.md  # LangChain NPC documentation
├── public/                # Static assets
├── image-cache/           # Cached generated scenes
├── saves/                 # Saved game files
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## Installation

### Prerequisites
- Node.js 20+
- Anthropic API key (for Claude)
- Stable Diffusion API access (e.g., Stability AI, local installation, or Replicate)

### Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment**:
Create `.env` file with your API keys:
```
ANTHROPIC_API_KEY=your_claude_api_key
SD_API_KEY=your_stable_diffusion_key
SD_API_URL=https://api.stability.ai/v1/generation
```
The backend uses Vite's `loadEnv` helper to automatically load `.env` when `npm run server` runs (without overriding vars you've already exported), so provider flags like `LLM_PROVIDER=ollama` are picked up without extra CLI wrappers.

3. **Run development server**:
```bash
# Terminal 1: Start backend API server
npm run server

# Terminal 2: Start frontend dev server
npm run dev
```

4. **Open browser**:
Navigate to `http://localhost:3000`

## How to Play

### Controls
- **Arrow Keys / WASD**: Move one tile (North, South, East, West)
- **Q / E**: Rotate 90° left/right
- **Space**: Interact with object/NPC
- **C**: Open character sheet
- **I**: Open inventory
- **M**: Cast memorized spell
- **R**: Rest/camp (heal and restore spells)
- **Esc**: Menu/pause

### Character Creation
1. Roll ability scores (or use point buy)
2. Choose race and class
3. Select starting equipment
4. AI generates character portrait
5. Begin adventure!

### Combat Flow
1. **Encounter**: AI narrates monster appearance
2. **Initiative**: Roll 1d10 + DEX modifier
3. **Player Turn**: Attack, cast spell, use item, or flee
4. **Attack Roll**: 1d20 vs. THAC0 - enemy AC
5. **Damage Roll**: Weapon damage + STR modifier
6. **Victory**: Gain XP and loot

### Exploration Tips
- **Save often**: Use the menu to save your progress
- **Manage resources**: Spells and HP don't regenerate without rest
- **Map mentally**: The world is consistent; learn the layout
- **Talk to NPCs**: AI-powered NPCs remember conversations and build relationships
- **Build relationships**: NPCs react differently based on your past interactions
- **Search for secrets**: Examine walls and objects for hidden doors/traps

### Interacting with NPCs
- **Approach**: Move within 1 tile of an NPC
- **Initiate**: Press Space to start conversation
- **Choose dialogue**: Select from context-aware options
- **Remember**: NPCs track your choices and relationship levels
- **12 Archetypes**: Merchant, Guard, Innkeeper, QuestGiver, Hermit, Priest, Thief, Noble, Peasant, Scholar, Blacksmith, Mysterious Stranger

## AD&D Rules Reference

### THAC0 (To Hit Armor Class 0)
```
Attack Roll: 1d20 + modifiers
Hit if: Roll >= (THAC0 - Target AC)

Example:
- Fighter THAC0: 18
- Orc AC: 6
- Need to roll: 18 - 6 = 12 or higher
```

### Saving Throws
Five categories with different difficulty numbers:
- **Death Magic/Poison**
- **Wands**
- **Paralysis/Turn to Stone**
- **Breath Weapon**
- **Spells/Rods/Staves**

Roll 1d20 ≥ save value to succeed.

### Experience & Leveling
- Kill monsters: XP based on HD and special abilities
- Complete quests: AI DM awards story XP
- Find treasure: 1 XP per gold piece value
- Level up: Consult class XP table, roll HD for new HP

### Spell Memorization
1. Rest 8 hours
2. Select spells from spellbook (Magic-User) or prayer (Cleric)
3. Fill available spell slots
4. Cast spells (one-time use until next rest)

## Stable Diffusion Prompts

The game generates prompts for consistent pixel art style:

### Template
```
160x100 pixel art, 256-color palette, retro RPG style,
[perspective: top-down/isometric], [location description],
[entities present], [lighting/atmosphere],
inspired by Pool of Radiance and SSI Gold Box games
```

### Example Prompts
```
"160x100 pixel art, 256-color EGA palette, top-down view,
stone dungeon corridor, torch sconces on north wall,
wooden door to the east, goblin warrior 10 feet ahead
holding rusty sword, dim torchlight, retro RPG style"

"160x100 pixel art, 256-color palette, isometric view,
tavern interior, wooden tables and chairs, fireplace on west wall,
bearded dwarf bartender behind counter, cozy warm lighting,
classic D&D video game aesthetic"
```

## Performance Optimization

### Caching Strategy
- **View Hash**: `SHA256(x,y,facing,entityIDs,lighting,timeOfDay)`
- **Cache Hit**: Instant image load (< 50ms)
- **Cache Miss**: Generate via SD (~3-8 seconds)
- **Storage**: Images saved as PNG in `/image-cache/`
- **Cleanup**: LRU eviction when cache exceeds 500MB

### Generation Settings
- **Resolution**: 160x100 (upscaled 2x for display)
- **Steps**: 20-30 (balance quality vs. speed)
- **CFG Scale**: 7-9 (prompt adherence)
- **Model**: SD 1.5 or SDXL with pixel art LoRA

## Development Roadmap

### Phase 1: Foundation ✓
- [x] Project setup
- [x] TypeScript configuration
- [x] Vite build system

### Phase 2: Core Systems ✓
- [x] World map and entity storage
- [x] AD&D character system
- [x] Combat mechanics (THAC0, damage, saves)
- [x] Movement and rotation

### Phase 3: AI Integration ✓
- [x] Claude DM API client
- [x] LangChain NPC agent system with 12 archetypes
- [x] NPC memory and relationship tracking
- [x] Stable Diffusion scene generation
- [x] Image caching system
- [x] Prompt engineering for consistent art

### Phase 4: UI & Rendering
- [ ] Canvas renderer (320x200 viewport)
- [ ] Character sheet panel
- [ ] Combat log and message system
- [ ] Inventory interface

### Phase 5: Content
- [ ] Dungeon generator
- [ ] Monster stat blocks
- [ ] Spell implementations
- [ ] Magic items and equipment

### Phase 6: Polish
- [ ] Save/load system
- [ ] Death and resurrection
- [ ] Sound effects
- [ ] Balancing and playtesting

## Troubleshooting

### Slow Image Generation
- Check SD API status and rate limits
- Reduce image generation steps (20 instead of 50)
- Ensure caching is working (check `/image-cache/` directory)

### AI DM Not Responding
- Verify `ANTHROPIC_API_KEY` in `.env`
- Check Claude API quota and billing
- Review server logs for error messages

### Visual Glitches
- Ensure browser supports Canvas API
- Check image rendering CSS (pixelated/crisp-edges)
- Verify 256-color palette conversion

## Credits

- **Game Design**: Inspired by SSI Gold Box games (Pool of Radiance, Curse of the Azure Bonds)
- **Rules**: Advanced Dungeons & Dragons 1st/2nd Edition (TSR, Inc.)
- **AI**: Claude by Anthropic, Stable Diffusion
- **Development**: Built with TypeScript, Vite, Express

## License

This is a fan project for educational purposes. D&D and Advanced Dungeons & Dragons are trademarks of Wizards of the Coast.

---

**May your dice roll high and your adventures be legendary!** 🎲
