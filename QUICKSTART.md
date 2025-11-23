# Quick Start Guide - D&D AN

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...your-key...
VITE_SD_API_URL=http://localhost:3001/api
VITE_SD_API_KEY=optional
```

### 3. Run the Game

**Option A: Full Stack (with backend)**
```bash
# Terminal 1: Start backend server
npm run server

# Terminal 2: Start frontend
npm run dev
```

**Option B: Frontend Only** (limited AI features)
```bash
npm run dev
```

### 4. Play!

Open your browser to: `http://localhost:3000`

## Controls

| Key | Action |
|-----|--------|
| ↑ / W | Move North |
| ↓ / S | Move South |
| ← / A | Move West |
| → / D | Move East |
| Q | Rotate Left (90°) |
| E | Rotate Right (90°) |
| Space | Interact |
| C | Character Sheet |
| I | Inventory |
| M | Cast Spell |
| R | Rest (heal & restore) |
| ESC | Menu |

## First Steps

1. **Explore**: Use arrow keys to move through the dungeon
2. **Rotate**: Press Q/E to change your facing direction
3. **Combat**: Move into a tile with a monster to initiate combat
4. **Rest**: Press R to heal and restore spell slots (takes 8 hours)
5. **Level Up**: Gain XP from combat to level up your character

## Tips

- **Scene Caching**: The first time you visit a location, it takes 3-8 seconds to generate the image. Returning to the same view is instant!
- **Save Progress**: Currently no save system - play in one session
- **Death**: If you die, refresh the page to start over
- **AI Narration**: The AI DM describes events in the message log

## Building & Deployment

### Build for Production

```bash
npm run build
```

Output in `dist/` directory.

### Deploy to Vercel/Netlify

1. Build the project: `npm run build`
2. Upload `dist/` folder
3. Set environment variables in hosting dashboard

## Troubleshooting

### "Failed to initialize game"
- Check that you have added `VITE_ANTHROPIC_API_KEY` to `.env`
- Verify your API key is valid
- Check browser console for errors

### Scene generation stuck
- The first scene takes 3-8 seconds (SD generation)
- If stuck > 10 seconds, check backend server is running
- Fallback: Uses placeholder images if generation fails

### No monsters appearing
- Monsters spawn randomly in the dungeon
- Walk around to trigger encounters (10% chance per move)
- Check message log for encounter notifications

## Next Steps

- Read `README.md` for full documentation
- Check `docs/DEVELOPMENT.md` for development guide
- See `docs/GAME_DESIGN.md` for game mechanics
- Review `docs/API.md` for technical reference

## Getting Help

- GitHub Issues: Report bugs or request features
- Documentation: Check the `/docs` folder
- Code Comments: Extensive inline documentation

## Game Features

✅ **Implemented**:
- AD&D 1st/2nd Edition rules (THAC0, saves, classes)
- AI Dungeon Master (Claude) for narrative
- Scene generation (Stable Diffusion) with caching
- Grid-based movement & rotation
- Turn-based combat
- Dungeon generation (BSP algorithm)
- Character creation & leveling
- Multiple character classes and races
- Monster encounters
- Equipment system

🚧 **Planned**:
- Save/load system
- Party management (multiple characters)
- More spells and magic items
- Quest system
- NPC interactions
- Overworld map
- Character portraits

Enjoy your adventure! 🎲
