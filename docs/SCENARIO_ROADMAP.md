# DnDan — Scenario-Led Roadmap

This roadmap deliberately avoids implementation minutiae. The project should first prove that it can produce the target tabletop experience described in [TARGET_SCENARIOS.md](TARGET_SCENARIOS.md), then choose architecture and tooling that serve that experience.

## North Star

DnDan is a faithful digital reproduction of a tabletop fantasy RPG session run by an expert Dungeon Master.

The rules determine what happens. The AI determines how it is experienced.

The first milestone is not graphics, realtime voice, procedural maps, or a full campaign. The first milestone is a table experience that feels fair, alive, continuous, and mechanically trustworthy.

## Experience Contract

Every major design decision must support at least one of these demands:

1. Every intent gets a fair adjudication.
2. Mechanical truth is inviolable and auditable.
3. Every actor knows only what they have learned.
4. History accumulates and compounds.
5. The fiction leads; the numbers follow.
6. The table's social fabric is part of the product.

If a feature does not strengthen one of these demands, it is decoration and should wait.

## Milestone 1 — The Fight That Isn't a Spreadsheet

**Primary scenario:** Scenario 6.

Prove that combat can be exact underneath and cinematic on the surface.

The system must support:

- authoritative combat state
- turn order
- exact dice and modifiers
- exact damage application
- exact resource expenditure
- legible tactical situation summaries
- status through fiction rather than exposed enemy hit points
- fast narration that does not turn every die into a report line

Success means a player can tally every number and find no discrepancy, while the spoken/table experience still feels like a human DM running a tense fight.

## Milestone 2 — The Chandelier

**Primary scenario:** Scenario 1.

Prove that free-form player intent can become fair adjudication.

The system must support:

- interpreting unusual intent
- proposing a ruling
- stating check, DC, success stakes, and failure stakes before dice
- allowing the player to commit or revise
- applying the mechanical result as real state
- recording table precedent

Success means the player never hits a hard "unsupported action" wall, but also never gets hidden post-roll consequences.

## Milestone 3 — The Player Tries It On

**Primary scenario:** Scenario 8.

Prove that the engine's authority is absolute but relaxed.

The system must support:

- verifying claimed rolls against actual rolls
- verifying inventory and previous state
- refusing impossible asks without breaking tone
- distinguishing impossible outcomes from difficult outcomes
- redirecting toward viable fictional approaches
- keeping social skills powerful but bounded

Success means enforcement feels like a good table, not a validation error.

## Milestone 4 — The Innkeeper Doesn't Know

**Primary scenario:** Scenario 2.

Prove that knowledge scoping works.

The system must support:

- global campaign truth
- actor-known truth
- party-known truth
- public table truth
- scoped prompting for NPCs and monsters
- natural recall unlocked by the right description or context
- no accidental leakage through tone, narration, or vibes

Success means an NPC can sincerely repeat false information because that is all they know, and the AI never accidentally hints at hidden truth.

## Milestone 5 — The Whisper

**Primary scenario:** Scenario 10.

Prove that private information works without derailing the shared table.

The system must support:

- private DM-to-player messages
- private player-to-DM replies
- public narration that does not leak private information
- parallel private and public threads
- per-character knowledge updates
- honest scoped investigation by other characters

Success means secrets create table tension without becoming spoilers or pacing failures.

## Milestone 6 — You Play the Dragon

**Primary scenario:** Scenario 7.

Prove that control handover is seamless.

The system must support:

- persistent actor identity independent of controller
- temporary human control of player characters, NPCs, monsters, or villains
- scoped knowledge briefings before handover
- enforcement of what the controlled actor does not know
- conservative AI control of absent player characters
- AI resumption without personality or continuity drift

Success means a player can briefly play a dragon, establish canon, then hand control back without the dragon becoming a different character.

## Milestone 7 — The Village You Left Behind

**Primary scenario:** Scenario 4.

Prove that history compounds into causal off-screen consequence.

The system must support:

- event history
- in-world time progression
- world state updates while players are elsewhere
- NPC memory of relationships and choices
- causal off-screen simulation rather than arbitrary random punishment
- persistent details such as names, banners, damage, defences, and attitudes

Success means returning to a place feels like returning to a living world, not a reset scene.

## Milestone 8 — The Campfire

**Primary scenario:** Scenario 5.

Prove that quiet, non-mechanical roleplay can be the best scene of the night.

The system must support:

- character-specific memory
- small true callbacks
- psychology as narrative context, not numeric emotion meters
- silence and pacing
- scenes that do not require dice, plot hooks, XP, or combat
- persistent relationship development

Success means an NPC can respond to grief, loyalty, guilt, or trust with specific remembered texture rather than generic therapy dialogue.

## Milestone 9 — Growing Without a Progress Bar

**Primary scenario:** Scenario 9.

Prove that advancement is felt before it is itemised.

The system must support:

- hidden advancement tracking for narration
- precise mechanical summary on request or between sessions
- growth moments tied to specific campaign events
- advancement choices handled outside dramatic table moments
- clear separation between hiding numbers from narration and hiding numbers from players

Success means levelling feels like character growth first and bookkeeping second.

## Milestone 10 — The Rules Lawyer

**Primary scenario:** Scenario 3.

Prove that rules disputes are safe, correctable, and socially natural.

The system must support:

- rule lookup when challenged
- citations or traceable rule references
- admitting mistakes without losing tone
- rejecting incorrect player assertions with evidence
- permanently remembering corrections and precedents
- repairing mechanical state after a correction

Success means rules debate feels like table banter, not a support ticket or authority contest.

## Later Enhancements

Only after the experience contract is demonstrated should the project invest heavily in richer presentation.

Later layers include:

- character portraits
- location art
- generated maps and handouts
- ambient sound
- adaptive music
- text-to-speech
- speech-to-text
- realtime voice
- human/AI mixed multiplayer tables
- guest NPC and guest monster participation
- AI-assisted human Dungeon Master mode

These must remain presentation and facilitation layers. The campaign must remain playable as text.

## Non-Goals for the First Rewrite

The first rewrite should not attempt to prove:

- procedural infinite campaigns
- full voice conversation
- generated art per scene
- full tactical map rendering
- autonomous faction simulation at scale
- complete rulebook automation
- realtime multiplayer voice

Those are worthwhile later. They are not prerequisites for proving the table experience.

## First Build Target

The first build target should be a text-first, session-style prototype that can run these scenes:

1. one short exact combat
2. one improvised chandelier-style stunt
3. one NPC knowledge-scoping conversation
4. one private whisper
5. one temporary monster handover

If those work, the project has a real foundation.

If those do not work, better graphics, bigger models, or more containers will not save it.
