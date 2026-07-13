# DnDan Vision Review

## Executive Summary

DnDan is not intended to be another CRPG, roguelike, or AI chatbot pretending to play Dungeons & Dragons.

Its purpose is to faithfully reproduce the experience of participating in a real tabletop roleplaying game run by an expert Dungeon Master while using AI to enhance the experience in ways that are impossible around a physical table.

The project is founded on a simple principle:

> **The rules determine what happens. The AI determines how it is experienced.**

The deterministic engine owns the mechanical truth.

The AI owns narration, roleplay, atmosphere, memory, personality, presentation, and interpretation.

Everything else builds upon this separation.

---

# Vision

The ultimate goal is to create the closest possible approximation of sitting around a table with talented friends and an exceptional Dungeon Master.

Not simply reproducing the mechanics.

Reproducing the feeling.

The tension.

The humour.

The arguments.

The personalities.

The unexpected solutions.

The memorable stories.

The technology should disappear into the background.

Players should feel as though they are participating in a living campaign rather than interacting with software.

---

# Design Philosophy

## The world exists independently

The world should exist whether or not the players are looking at it.

Characters continue living.

Factions pursue goals.

Weather changes.

Wars progress.

Rumours spread.

Merchants travel.

NPCs remember.

Nothing should exist solely because a player entered an area.

---

## The rules are objective

Mechanics are never invented by AI.

Combat.

Dice.

Movement.

Spells.

Inventory.

Conditions.

Visibility.

Knowledge.

Travel.

Resources.

These are deterministic.

Given identical inputs, identical outcomes are produced.

---

## The AI behaves like an expert DM

The AI is not responsible for deciding mechanical outcomes.

Instead it:

- narrates
- roleplays
- interprets player intent
- provides atmosphere
- remembers campaign history
- answers questions
- presents information naturally
- plays NPCs
- consults rule references
- generates multimedia

The AI should never fabricate mechanical facts.

---

# World Model

The engine should not be built around "rooms."

Rooms are merely one possible type of place.

Instead the core concepts become:

- Campaign
- Session
- Location
- Situation
- Encounter
- Character
- Actor
- Event

Examples of Locations:

- Forest
- Village
- Road
- Ship
- Castle
- Tavern
- Battlefield
- Dungeon
- Mountain pass

Examples of Situations:

- Negotiation
- Investigation
- Ambush
- Campfire
- Chase
- Combat
- Exploration
- Puzzle
- Trial

The world is represented as connected locations containing evolving situations.

---

# Events

Everything meaningful becomes an event.

Examples:

- CharacterCreated
- TravelStarted
- WeatherChanged
- LocationEntered
- SituationStarted
- TrapTriggered
- InitiativeRolled
- AttackResolved
- DamageApplied
- CharacterDied
- NPCRemembered
- StoryMilestoneReached

Events become the permanent history of the campaign.

Everything else can be reconstructed.

---

# Characters

Characters are autonomous people.

Not chess pieces.

Each possesses:

- memories
- personality
- goals
- fears
- relationships
- values
- current emotional state
- current knowledge

The AI interprets these.

The deterministic engine validates actions.

---

# Psychology

Psychology should not become deterministic mathematics.

There should not be "anger = 7."

Instead each character maintains evolving narrative context.

Examples:

- distrusts nobles
- exhausted after days of rain
- impressed by the player's courage
- frightened of undead
- guilty about abandoning a village
- increasingly respects Mara

Future behaviour emerges from accumulated context rather than numerical emotion bars.

---

# Knowledge

Knowledge is one of the most important systems.

Every actor only knows what they have legitimately learned.

Players.

NPCs.

Monsters.

Villains.

The AI must never use information unavailable to the character it is currently portraying.

Knowledge becomes a first-class part of simulation.

---

# Character Control

Characters possess identity independent of controller.

Controllers are temporary.

A character may be controlled by:

- AI
- Human
- Multiple humans (future)

Control may transfer seamlessly during play.

A player can temporarily assume control of:

- party member
- NPC
- monster
- villain

When control ends, the AI resumes naturally.

No continuity is lost.

---

# Human Roles

The system should support multiple participation styles.

Examples include:

- Dungeon Master
- Player
- Co-DM
- Observer
- Guest NPC
- Guest Monster

People may move between these roles naturally during a session.

---

# AI Roles

Rather than one monolithic agent, specialised AI roles should exist.

Examples:

## Narrator

Converts deterministic events into rich prose.

## Character Actor

Determines what an autonomous character would plausibly attempt.

## NPC Actor

Runs ordinary NPCs.

## Rules Researcher

Consults indexed reference material.

## Campaign Historian

Summarises history and recalls continuity.

## Session Director

Controls presentation, pacing, and transitions.

These roles should remain independent.

---

# Rule References

Reference material is consulted through retrieval rather than embedded directly into prompts.

The AI should answer questions such as:

- What rule applies?
- Which spell description is relevant?
- How does this monster ability work?

The AI proposes.

The rules engine decides.

---

# Advancement

Players should not watch experience bars.

Characters grow naturally.

The rules engine tracks progression privately.

The AI reveals growth through narration.

Examples:

"You feel your confidence growing."

"Months of hardship have sharpened your instincts."

Only afterwards are mechanical improvements revealed.

Growth is experienced narratively before mechanically.

---

# Multiplayer

The primary entity is not a save file.

It is a table.

A campaign may contain:

- human players
- AI players
- AI NPCs
- AI monsters
- human guest monsters
- observers

If a participant disconnects, the AI may temporarily resume their role.

The campaign continues.

---

# Voice

Voice should be treated as a presentation layer.

The architecture should support:

- speech recognition
- speech synthesis
- interruptions
- overlapping conversation
- individual voices
- private whispers
- in-character dialogue

Text remains the authoritative representation.

Voice is another interface.

---

# Multimedia

Media should enhance, never replace, imagination.

Possible outputs include:

- portraits
- location artwork
- maps
- journals
- letters
- ambient sound
- adaptive music
- spoken dialogue

The campaign remains fully playable without any multimedia.

---

# Human Dungeon Master Mode

A human should be able to act as Dungeon Master while AI assists.

The AI can:

- track bookkeeping
- manage initiative
- consult references
- roleplay NPCs
- generate descriptions
- maintain continuity
- create visual assets

The human remains the final authority.

---

# AI Dungeon Master Mode

Alternatively, the AI can run the campaign itself.

In this mode the AI performs traditional DM responsibilities while remaining constrained by deterministic rules.

---

# Guiding Influence Mode (Future)

A possible future mode allows a player to influence the party without directly controlling individuals.

The player expresses themes such as:

- caution
- urgency
- mercy
- aggression
- curiosity

Individual characters interpret those influences according to their personalities.

This mode should be considered experimental.

---

# Architecture Principles

The project should maintain strict boundaries.

Rules determine outcomes.

AI proposes behaviour.

Presentation communicates outcomes.

Persistence records history.

No component should own more than one concern.

---

# Long-Term Vision

Eventually the system should support experiences impossible at a physical table.

Examples include:

- persistent living worlds
- autonomous NPC societies
- adaptive orchestral music
- generated illustrations
- voice conversations
- dynamic campaign journals
- seamless human/AI control handover
- campaigns continuing for years

Despite these enhancements, the core objective never changes.

The experience should always feel like participating in a tabletop roleplaying campaign with an exceptional Dungeon Master.

The technology should amplify the tabletop experience, never replace it.

---

# Guiding Principles

1. The world exists independently of the players.
2. Mechanics are deterministic.
3. AI enhances experience, not rules.
4. Every actor has persistent identity.
5. Control is temporary.
6. Knowledge is scoped and respected.
7. Psychology is contextual, not numerical.
8. The campaign is event-driven.
9. Multimedia is optional.
10. The goal is to faithfully reproduce tabletop roleplaying before extending it beyond what is possible at a physical table.
