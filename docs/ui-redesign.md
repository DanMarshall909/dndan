# Retro Terminal RPG - UI Redesign Specification

## Overview

This document specifies the UI redesign for the retro terminal RPG, focusing on improved layout, better narrative presentation, and reduced cognitive load while maintaining the green-on-black CRT aesthetic.

**Target Resolution:** 960x600px (fixed)
**Selected Layout:** "Immersive Focus" (Layout B)

---

## 1. Design Principles

### Information Hierarchy

**Always Visible (Glanceable):**
- HP/Status (survival critical)
- Minimap (navigation)
- Active effects (tactical awareness)

**Contextual (One Keypress):**
- Full stats (Tab)
- Inventory (I)
- Spell list (C)

**On Demand (Intentional Access):**
- Character sheet modal
- Quest log
- Game options

---

## 2. Color Palette

```
Primary:        #0f0  (bright green)    - Main text, player
Secondary:      #0a0  (dark green)      - Borders, muted
Background:     #000  (black)           - Base
Panel BG:       #0a0a0a                 - Slight lift from black

Accent Yellow:  #ff0  (yellow)          - Highlights, gold, crits
Accent Cyan:    #0ff  (cyan)            - AI narrative, magic
Accent Red:     #f44  (soft red)        - Damage, enemies, warnings
Accent Blue:    #48f  (blue)            - Stairs, water, info

HP Bar Colors:
  75-100%:      #0f0  (green)
  50-74%:       #ff0  (yellow)
  25-49%:       #f80  (orange)
  0-24%:        #f44  (red)

Combat Log Colors:
  Critical:     #ff0  (yellow)
  Hit:          #0f0  (green)
  Miss:         #666  (gray)
  Damage Taken: #f44  (red)
  Heal:         #4f4  (bright green)
  System:       #888  (gray)
  Narrative:    #0ff  (cyan)
```

---

## 3. Typography & Spacing

```
Font:           'Courier New', monospace

Font Sizes:
  - Panel headers:  14px, bold
  - Body text:      12px
  - Compact/stats:  10px
  - Narrative:      13px (slightly larger for readability)

Line Heights:
  - Normal text:    1.4
  - Narrative:      1.6 (better readability)
  - Compact stats:  1.2

Padding:
  - Panel outer:    8px
  - Panel inner:    6px
  - Between items:  4px

Margins:
  - Between panels: 6px
  - Section gaps:   8px
```

---

## 4. Layout Specification

### "Immersive Focus" Layout

```
+------------------------------------------------------------------+
|  COMPACT STATUS BAR (940x28)                                      |
|  HP ████████░░ 24/30 │ AC 16 │ ⚔Bless(3) ☠Poison(2) │ Lv.5      |
+------------------------------------------------------------------+
|                                                    | MINI  |      |
|  MAIN VIEW (480x380)                               | MAP   |      |
|  ┌──────────────────────────────────────────────┐  | 96x96 |      |
|  │                                              │  |       |      |
|  │                                              │  +-------+      |
|  │     [Expanded First-Person View]             │                 |
|  │                                              │  QUICK STATS    |
|  │                                              │  STR 16 DEX 14  |
|  │                                              │  Sword +1       |
|  │                                              │  Chain Mail     |
|  │                                              │                 |
|  │                                              │  [Tab] Full     |
|  └──────────────────────────────────────────────┘                 |
+------------------------------------------------------------------+
|  NARRATIVE ZONE (940x140)                                         |
|  ┌────────────────────────────────────────────────────────────┐   |
|  │                                                            │   |
|  │   The goblin snarls, raising its rusty blade. Behind it,   │   |
|  │   you glimpse the glint of gold—the treasure you seek.     │   |
|  │                                                            │   |
|  │   ─────────────────────────────────────────────────────    │   |
|  │   [dim] Rolled 18 vs AC 12: Hit! 8 damage. Goblin: 4/12 HP │   |
|  │                                                            │   |
|  └────────────────────────────────────────────────────────────┘   |
+------------------------------------------------------------------+
|  [1]Attack [2]Defend [3]Cast [4]Item [5]Flee │ [I]nv [C]har [M]ap |
+------------------------------------------------------------------+
```

### Component Dimensions

| Component | Width | Height | Position |
|-----------|-------|--------|----------|
| Status Bar | 940px | 28px | Top, centered |
| Main View | 480px | 380px | Left of center |
| Minimap | 96px | 96px | Top-right area |
| Quick Stats | 160px | 284px | Below minimap |
| Narrative Zone | 940px | 140px | Below main view |
| Action Bar | 940px | 28px | Bottom |
| Container margins | 10px | - | All sides |

---

## 5. Component Specifications

### 5.1 Compact Status Bar

```
┌──────────────────────────────────────────────────────────────┐
│ HP ████████░░ 24/30 │ AC 16 │ ⚔Bless(3) ☠Poison(2) │ Lv.5  │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- HP bar with visual fill (color changes based on %)
- Critical stats always visible (AC, Level)
- Active effects as compact icons with duration in parentheses
- Click/hover to expand details

**Implementation:**
- Height: 28px
- Font size: 12px
- Separator: │ (box drawing character)
- HP bar: 10 characters wide (█ and ░)

---

### 5.2 Enhanced Minimap

```
┌─────────────────────┐
│ ░░░░░▓▓▓░░░░░░░░░░ │
│ ░░░░░▓▓▓░░░░░░░░░░ │
│ ░░###...###░░░░░░░ │
│ ░░#.......#░░░░░░░ │
│ ░░#...@→..+░░░░░░░ │
│ ░░#.......#░░░░░░░ │
│ ░░###.M.###░░░░░░░ │
│ ░░░░░...░░░░░░░░░░ │
│ ░░░░░...░░░░░░░░░░ │
└─────────────────────┘
```

**Tile Markers:**
- `@` Player (bright green)
- `→←↑↓` Direction indicator (yellow)
- `M` Monster (red, pulsing in combat)
- `!` Item (yellow)
- `$` Treasure (gold)
- `>` Stairs down (blue)
- `<` Stairs up (cyan)
- `+` Door (brown/orange)
- `░` Fog of war (dark gray)

**Features:**
- Field-of-view cone showing current facing
- Fog of war for unexplored areas
- Zoom levels: 3x3, 5x5, 7x7 tiles per view
- Controls: `+/-` zoom, `F` toggle FOV cone

**Dimensions:** 96x96px with 4px tile size

---

### 5.3 Quick Stats Panel

```
┌────────────────┐
│ STR 16  DEX 14 │
│ CON 15  INT 10 │
│                │
│ ⚔ Sword +1    │
│ 🛡 Chain Mail  │
│                │
│ [Tab] Full     │
└────────────────┘
```

**Features:**
- Abbreviated ability scores (2 per row)
- Current weapon and armor
- Hint to access full character sheet
- Collapsible on smaller views

---

### 5.4 Narrative Zone

**Primary Section (AI Narrative):**
```
The goblin snarls, raising its rusty blade. Behind it,
you glimpse the glint of gold—the treasure you seek.
```
- Color: `#0ff` (cyan)
- Font size: 13px
- Line height: 1.6
- Padding: 12px

**Secondary Section (Mechanical Log):**
```
─────────────────────────────────────────────────────
[dim] Rolled 18 vs AC 12: Hit! 8 damage. Goblin: 4/12 HP
```
- Color: `#888` (gray)
- Font size: 10px
- Separated by horizontal rule
- Auto-scrolls, max 50 entries

**Features:**
- Clear visual separation between narrative and mechanics
- Narrative takes 70% of vertical space
- Mechanics are present but de-emphasized
- Scrollable history

---

### 5.5 Action Bar

```
[1]Attack [2]Defend [3]Cast [4]Item [5]Flee │ [I]nv [C]har [M]ap
```

**Features:**
- Numbered combat actions (1-5)
- Utility shortcuts (I, C, M)
- Visual separator between action types
- Highlights current available actions
- Dims unavailable actions

**Styling:**
- Height: 28px
- Font size: 11px
- Key indicators: `[1]` in bright green
- Action names: standard green

---

### 5.6 Active Effects Display

Shown in status bar as compact icons:

```
⚔Bless(3) ☠Poison(2) 🛡Shield(∞)
```

**Full Panel (on hover/expand):**
```
┌─ EFFECTS ────────────────────┐
│ ⚔ Bless        +1 atk  (3)  │
│ ☠ Poisoned    -1d4/rd (2)  │
│ 🛡 Shield      +2 AC   (∞)  │
└──────────────────────────────┘
```

**Color by Type:**
- Buff (positive): `#0f0` green
- Debuff (negative): `#f44` red
- Defensive: `#48f` blue
- Elemental: `#f80` orange

**Features:**
- Icon + Name + Effect + Duration
- Pulsing animation when 1 round left
- Sorted: Negative first, then by duration

---

### 5.7 Narration Mode

Toggle with `N` key. Fades everything except narrative:

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                                                              │
│     The ancient door groans open, revealing a chamber        │
│     bathed in an eerie phosphorescent glow. Mushrooms        │
│     the size of trees crowd the cavern, their caps           │
│     pulsing with bioluminescent light.                       │
│                                                              │
│     At the chamber's heart, upon a pedestal of black         │
│     stone, rests the artifact you seek—the Shard of          │
│     Endless Night. But between you and your prize            │
│     stands the guardian: a creature of living shadow,        │
│     its form shifting and coiling like smoke.                │
│                                                              │
│                                                              │
│                    [Press any key to continue]               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Background: Game view at 20% opacity
- Narrative box: Centered, 80% width
- Font size: 14px
- Line height: 1.8
- Border: Double line (`═`)

---

## 6. Keyboard Controls

### Movement & View
| Key | Action |
|-----|--------|
| W / ↑ | Move forward |
| S / ↓ | Move backward |
| A / ← | Strafe left |
| D / → | Strafe right |
| Q | Turn left 90° |
| E | Turn right 90° |

### Actions
| Key | Action |
|-----|--------|
| Space | Interact / Confirm |
| Esc | Cancel / Menu |
| Enter | Send message (chat) |

### Panels
| Key | Action |
|-----|--------|
| Tab | Toggle full character sheet |
| I | Inventory |
| C | Cast spell |
| M | Toggle large map |
| N | Narration mode |
| L | Focus log (scroll with ↑↓) |

### Combat
| Key | Action |
|-----|--------|
| 1-5 | Quick action slots |
| R | Rest |
| F | Flee |

### Minimap
| Key | Action |
|-----|--------|
| +/- | Zoom in/out |
| Shift+F | Toggle FOV cone |

---

## 7. Tooltip System

```
┌─────────────────────────────────┐
│  Longsword +1                   │
│  ───────────────────            │
│  Damage: 1d8+1 slashing         │
│  THAC0 Bonus: +1                │
│  Weight: 4 lbs                  │
│                                 │
│  A finely crafted blade with    │
│  a faint magical aura.          │
└─────────────────────────────────┘
```

**Behavior:**
- Appears after 500ms hover delay
- Border color matches item rarity
- Positioned to not obscure hovered element
- Dismissed on mouse move or keypress

---

## 8. Tabbed Character Panel

When Tab is pressed, overlay appears:

```
┌─ CHARACTER ──────────────────────────────────┐
│ [Stats] [Gear] [Spells] [Log]                │
├──────────────────────────────────────────────┤
│                                              │
│ VALDRIS                        Level 5       │
│ Human Fighter                                │
│                                              │
│ HP  24/30  ████████░░                        │
│ AC  16     THAC0  17                         │
│ XP  12,450 / 16,000                          │
│                                              │
│ STR 16 (+2)    INT 10 (+0)                   │
│ DEX 14 (+1)    WIS 12 (+0)                   │
│ CON 15 (+1)    CHA  8 (-1)                   │
│                                              │
│ Saves:                                       │
│   Death 11  Wand 12  Paralysis 13            │
│   Breath 14  Spell 15                        │
│                                              │
└──────────────────────────────────────────────┘
```

**Tab Contents:**
1. **Stats**: Abilities, saves, combat stats
2. **Gear**: Equipment slots, inventory list
3. **Spells**: Prepared spells, spell slots
4. **Log**: Quest progress, notes

**Navigation:**
- `[` and `]` to switch tabs
- Number keys 1-4 as shortcuts
- Esc to close

---

## 9. Implementation Phases

### Phase 1: Core Layout
1. Restructure main container with new dimensions
2. Implement status bar component
3. Resize main view canvas to 480x380
4. Add quick stats panel
5. Reposition minimap

### Phase 2: Enhanced Components
1. Split narrative zone (story + mechanics)
2. Add action bar
3. Implement active effects display
4. Color-code log entries
5. Add HP bar visualization

### Phase 3: Minimap Improvements
1. Add FOV cone rendering
2. Implement fog of war
3. Add zoom levels
4. Update entity markers with new icons

### Phase 4: Polish & Interactions
1. Add tooltip system
2. Implement tabbed character panel
3. Add narration mode
4. Keyboard navigation improvements
5. Hover/focus states
6. Smooth animations (fade, slide)

---

## 10. CSS Variables

```css
:root {
  /* Colors */
  --color-primary: #0f0;
  --color-secondary: #0a0;
  --color-background: #000;
  --color-panel: #0a0a0a;
  --color-accent-yellow: #ff0;
  --color-accent-cyan: #0ff;
  --color-accent-red: #f44;
  --color-accent-blue: #48f;
  --color-muted: #666;

  /* HP Colors */
  --color-hp-full: #0f0;
  --color-hp-medium: #ff0;
  --color-hp-low: #f80;
  --color-hp-critical: #f44;

  /* Typography */
  --font-main: 'Courier New', monospace;
  --font-size-base: 12px;
  --font-size-small: 10px;
  --font-size-large: 14px;
  --font-size-narrative: 13px;
  --line-height-normal: 1.4;
  --line-height-narrative: 1.6;

  /* Spacing */
  --padding-panel: 8px;
  --padding-inner: 6px;
  --margin-between: 6px;
  --gap-section: 8px;

  /* Dimensions */
  --container-width: 960px;
  --container-height: 600px;
  --main-view-width: 480px;
  --main-view-height: 380px;
  --minimap-size: 96px;
  --status-bar-height: 28px;
  --action-bar-height: 28px;
  --narrative-height: 140px;
}
```

---

## 11. Benefits Summary

| Improvement | Benefit |
|-------------|---------|
| Expanded main view (480px) | Better visual immersion, more room for ASCII art |
| Compact status bar | Critical info without sidebar taking space |
| Split narrative/mechanics | AI storytelling prominence, mechanics accessible but secondary |
| Color-coded logs | Quick visual parsing of combat results |
| Active effects strip | Tactical awareness at a glance |
| Action bar | Combat actions immediately accessible, reduces memorization |
| Narration mode | Full immersion for key story moments |
| Keyboard-first design | Fast navigation without mouse dependency |
| Progressive disclosure | Reduced cognitive load, info when needed |

---

## 12. Accessibility Considerations

- High contrast green-on-black meets WCAG standards
- Keyboard-only navigation fully supported
- Color coding supplemented with icons/text
- Font sizes adjustable via CSS variables
- No reliance on color alone for critical info
- Tooltips provide additional context

---

## Appendix: Alternative Layouts

### Layout A: "Classic Split"

For players preferring more visible stats:

```
+------------------------------------------------------------------+
|  MAIN VIEW (400x360)                    | SIDEBAR (200px)        |
|                                         | Character stats        |
|                                         | Effects strip          |
|                                         | Minimap                |
+------------------------------------------------------------------+
|  STORY LOG (500px)     | COMBAT LOG (440px)                      |
+------------------------------------------------------------------+
|  HOTBAR                                                          |
+------------------------------------------------------------------+
```

### Layout C: "Tactical Grid"

For combat-focused players:

```
+------------------------------------------------------------------+
|  CHARACTER PANEL (180px)  |  MAIN VIEW (440x320)                 |
|  Full stats, equipment    |                                      |
|  Tabbed interface         +--------------------------------------+
|                           |  MINIMAP (120px)  | EFFECTS          |
+------------------------------------------------------------------+
|  LOG AREA with [Story|Mechanics|All] tabs                        |
+------------------------------------------------------------------+
```

These can be implemented as user-selectable layout options in settings.
