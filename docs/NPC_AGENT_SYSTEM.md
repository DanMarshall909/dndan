# LangChain NPC Agent System

## Overview

The D&D AN game now features AI-controlled world characters powered by LangChain. Each NPC is managed by an autonomous agent that can:
- Engage in dynamic conversations
- Remember past interactions
- Make decisions based on personality and context
- React to game events
- Control combat actions

## Architecture

### Components

1. **NPC Personas** (`src/ai/npc-personas.ts`)
   - 12 distinct NPC archetypes (Merchant, Guard, Innkeeper, QuestGiver, etc.)
   - Personality templates with motivations, knowledge areas, and speech patterns
   - Alignment-based behavior modifiers

2. **NPC Agent** (`src/ai/npc-agent.ts`)
   - Individual LangChain agent for each NPC
   - Uses Claude Sonnet 4.5 for intelligent responses
   - Memory system for tracking:
     - Conversation history
     - Known facts
     - Relationships with party members
   - Decision-making capabilities for actions

3. **NPC Manager** (`src/ai/npc-manager.ts`)
   - Central coordinator for all NPC agents
   - Handles lifecycle, spawning, and state management
   - Processes dialogue, actions, and combat decisions
   - Periodic NPC updates and autonomous behavior

4. **Game Engine Integration** (`src/game/engine.ts`)
   - NPCs spawn during dungeon initialization
   - Interactive dialogue system with multiple choice options
   - Proximity-based NPC detection
   - State management for dialogue mode

## NPC Archetypes

| Archetype | Personality | Quest Potential |
|-----------|-------------|-----------------|
| Merchant | Shrewd, profit-focused | Yes |
| Guard | Duty-bound, suspicious | No |
| Innkeeper | Hospitable, gossipy | Yes |
| QuestGiver | Desperate, determined | Yes |
| Hermit | Reclusive, wise, cryptic | Yes |
| Priest | Devout, compassionate | Yes |
| Thief | Cunning, untrustworthy | Yes |
| Noble | Proud, condescending | Yes |
| Peasant | Humble, fearful | No |
| Scholar | Intellectual, curious | Yes |
| Blacksmith | Practical, straightforward | No |
| Mysterious Stranger | Enigmatic, hidden agenda | Yes |

## How It Works

### 1. NPC Creation
```typescript
// Create a random NPC
const npc = npcManager.createRandomNPC(id, { x, y });

// Or create a specific NPC
const npc = npcManager.createNPC(
  id,
  "Aldric Blackwood",
  "a shrewd merchant with exotic wares",
  "Merchant",
  "Neutral Good",
  { x: 10, y: 15 }
);
```

### 2. Dialogue Processing
Each NPC has its own LangChain agent that:
- Receives player messages
- Considers its persona, motivations, and memory
- Generates contextually appropriate responses
- Updates its memory with the interaction

```typescript
const response = await npcManager.handleDialogue(
  npcId,
  playerName,
  "What can you tell me about this place?",
  "In the dungeon, discussing the area"
);
```

### 3. Memory System
NPCs remember:
- **Interactions**: Last 50 conversations
- **Facts**: Important information learned
- **Relationships**: Dynamic relationship levels with each party member
  - Hostile → Unfriendly → Neutral → Friendly → Allied

### 4. Autonomous Behavior
NPCs can make decisions based on:
- Current location and nearby entities
- Party members present
- Recent events
- Personal objectives
- Personality and alignment

## Player Interaction

### Starting Dialogue
1. Move near an NPC (within 1 tile)
2. Press the Interact key
3. The NPC greets you based on their personality
4. Choose from dialogue options:
   - Ask about the dungeon
   - Ask about quests
   - Trade
   - Farewell

### Conversation Flow
- NPCs respond naturally based on their archetype
- Merchants discuss trade and profit
- Guards ask questions and issue warnings
- Hermits speak in riddles
- Quest givers offer tasks
- Each NPC maintains conversation context

## Technical Details

### LangChain Integration
- **Model**: Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- **Temperature**: 0.9 (for varied NPC personalities)
- **Max Tokens**: 200 per response
- **Conversation Chain**: Uses `ChatPromptTemplate` with message history

### Performance Optimizations
- 10-second update interval for autonomous actions
- 10-second cooldown between NPC actions
- Memory limited to last 50 interactions per NPC
- Lazy loading of NPC agents

### API Configuration
NPCs use the same backend proxy as the Dungeon Master:
- Endpoint: `http://localhost:3001/api/claude`
- Conversation history maintained per NPC
- Automatic fallback for API errors

## Future Enhancements

### Planned Features
1. **Quest System Integration**
   - NPCs can dynamically generate quests
   - Quest completion affects relationships
   - Reward distribution

2. **Trading System**
   - Merchants maintain inventory
   - Dynamic pricing based on charisma
   - Haggling mechanics

3. **Combat Participation**
   - Friendly NPCs can join party
   - Hostile NPCs initiate combat
   - AI-controlled combat decisions

4. **World Reactions**
   - NPCs react to player actions
   - Reputation system
   - Dynamic relationship changes

5. **Persistent Memory**
   - Save/load NPC states
   - Long-term memory across sessions
   - Shared knowledge between NPCs

## Usage Example

```typescript
// Initialize NPC Manager
const npcManager = new NPCManager(apiKey, 10000);

// Spawn NPCs in dungeon
for (let i = 0; i < 5; i++) {
  const position = findRandomFloorTile();
  const npc = npcManager.createRandomNPC(generateId(), position);
  addToWorld(npc);
}

// Handle player interaction
const nearbyNPCs = npcManager.getNPCsAt(playerX, playerY, 1);
if (nearbyNPCs.length > 0) {
  const response = await npcManager.handleDialogue(
    nearbyNPCs[0].id,
    player.name,
    "Hello!",
    "Meeting in the dungeon"
  );
  displayMessage(response);
}

// Periodic updates
setInterval(async () => {
  const actions = await npcManager.updateNPCs(party, worldState);
  for (const action of actions) {
    processNPCAction(action);
  }
}, 10000);
```

## Configuration

### Environment Variables
```bash
ANTHROPIC_API_KEY=your_api_key_here
```

### NPC Manager Options
```typescript
new NPCManager(
  apiKey?,           // Optional API key (falls back to env)
  updateInterval?    // Update interval in ms (default: 5000)
)
```

## Troubleshooting

### NPCs Not Responding
1. Check that the backend server is running on port 3001
2. Verify ANTHROPIC_API_KEY is set
3. Check browser console for API errors
4. Ensure NPC has been properly initialized

### Memory Issues
- NPCs automatically limit memory to 50 interactions
- Conversations older than this are pruned
- No manual cleanup required

### Performance
- Reduce `updateInterval` for better performance
- Limit number of NPCs in dungeon
- NPC actions are rate-limited automatically

## Credits

Built with:
- [LangChain](https://js.langchain.com/) - Agent framework
- [Anthropic Claude](https://www.anthropic.com/) - Language model
- [TypeScript](https://www.typescriptlang.org/) - Type safety

---

For more information, see:
- [Game Design Document](GAME_DESIGN.md)
- [Development Guide](DEVELOPMENT.md)
- [API Documentation](API.md)
