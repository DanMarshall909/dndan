# DnDan — Target Scenarios

These scenarios define what DnDan must *feel like* before any implementation decisions are made.
Each one stresses a specific claim from the vision document. Format for each:

- **What it proves** — the vision claim under test
- **The scene** — an idealised transcript excerpt (the target experience)
- **What must be true** — experience-level requirements, not implementation
- **Failure smells** — what it looks like when this scenario goes wrong

Transcript conventions: **DM** is the AI (or AI-assisted) Dungeon Master. **Kira**, **Wren**, **Doss** are player characters. Dice results are shown as the table would hear them, not as logs.

---

## Scenario 1 — The Chandelier

**What it proves:** Free-form player intent becomes a fair, consistent ruling. The rules don't cover this; the game doesn't flinch.

**The scene**

> **Kira:** There's a chandelier, right? I want to cut the rope, swing across the room, and boot the cultist into the brazier.
>
> **DM:** There is indeed a chandelier, and it's exactly as load-bearing as it needs to be for this to be a terrible, wonderful idea. That's an improvised action — I'll call it Acrobatics to make the swing, DC 15, and if you connect, we'll treat the boot as a shove. Fail the swing and you're prone in the middle of the room with three cultists looking at you.
>
> **Kira:** Worth it. *(rolls)* 17.
>
> **DM:** You clear it. The rope screams through the pulley, you arc over the altar low enough to feel the candle heat, and both boots hit the cultist square in the chest — roll me that shove... he takes it in the sternum and staggers back into the brazier. Coals everywhere. He's now on fire *and* deeply reconsidering his religion. That's also where the round ends for you — you're standing where he was, smoke rising around you.

Later that session:

> **Wren:** Can I do the chandelier thing too? There's another one.
>
> **DM:** Same deal as Kira — Acrobatics DC 15, shove on a hit. House precedent now, apparently. This party has a genre.

**What must be true**
- The player never sees a "that action is not supported" moment. Every intent gets an adjudication.
- The ruling is stated *before* the roll: check, DC, stakes on success and failure. That's what a good DM does — informed consent before the dice.
- The ruling becomes precedent. The second chandelier gets the same DC without the player asking.
- The mechanical outcome (shove, prone, fire) is real and binding — it wasn't narrated flavour, it changes the fight.

**Failure smells**
- "You can't do that." / "Please choose: Attack, Dash, Dodge…"
- Stakes revealed only after the roll fails.
- The same stunt gets DC 15 on Tuesday and DC 20 on Thursday for no in-fiction reason.
- Narration says he's on fire but nothing mechanical happens.

---

## Scenario 2 — The Innkeeper Doesn't Know

**What it proves:** Knowledge scoping is real. NPCs only know what they've legitimately learned — even when the player fishes, and even though the AI "knows" everything.

**Setup:** The party is hunting a smuggler named Vane. Vane passed through this village three weeks ago under the false name "Corbin" and told the innkeeper he was a wool merchant heading south. Vane actually went east. The villain's true plan exists in the campaign, but this innkeeper has never heard any of it.

**The scene**

> **Doss:** I ask the innkeeper about Vane. Has anyone by that name come through?
>
> **DM:** She wipes down the bar, thinking. "Vane... no, can't say it rings a bell. We don't get many strangers, so I'd remember."
>
> **Doss:** Describe him. Tall, scar over the left eye, travels with a grey mule.
>
> **DM:** That lands. "Oh — the *mule*. Yes! Merchant fellow, wool trader. Corbin, he said. Polite enough, paid in advance, which I'll tell you is rarer than it should be. Three weeks back, maybe a touch more. Said he was heading south to the Delve markets."
>
> **Doss:** Was he lying?
>
> **DM:** She shrugs. "How would I know, love? He had a merchant's coat and a merchant's manners. People tell an innkeeper all sorts. I pour the ale either way."
>
> **Doss (to the table):** She's telling the truth *as she knows it*. Vane fed her the cover story. South is the false trail.

**What must be true**
- The innkeeper genuinely doesn't recognise "Vane" — she never heard that name. The description is what unlocks her memory, and that unlock feels natural.
- She repeats the *lie she was told* with full sincerity. She is not evasive, because she isn't hiding anything.
- Nothing in her dialogue, tone, or the DM's narration hints at the truth. No "she says, a little too confidently." The AI must not leak through vibes.
- If the players later return and tell her Corbin was a smuggler, *that* becomes something she knows — and she's furious about the "paid in advance" charm in retrospect.

**Failure smells**
- The NPC conveniently knows exactly what the plot needs her to know.
- Hedged narration that telegraphs deception the character isn't performing.
- Asking the same question twice yields contradictory memories.
- An NPC in the next village somehow already knows what the party told this one.

---

## Scenario 3 — The Rules Lawyer

**What it proves:** The table can argue about rules, the DM can be checked, and being corrected costs the game nothing. Mechanical truth is objective; the DM's authority is over rulings, not facts.

**The scene**

> **DM:** The wight hits you for 9 necrotic — and its Life Drain means your hit point *maximum* drops by 9 as well.
>
> **Wren:** Hang on. I'm pretty sure Life Drain only reduces the max on a failed Con save.
>
> **DM:** Let's check rather than guess. ...You're right — Constitution save, DC 13, max reduction only on a failure. My mistake. Roll it.
>
> **Wren:** *(rolls)* 15.
>
> **DM:** Save made. You take the 9, but you feel the cold *reaching* for something deeper and failing to grip. Your maximum holds. Good catch — and noted, so I don't fumble that one again.
>
> **Doss:** Petition to rename it "Wren's Save."
>
> **DM:** Denied, but recorded in the minutes.

**What must be true**
- The DM checks the actual rule text when challenged — it doesn't bluff, and it doesn't fold just because a player pushed.
- If the player is *wrong*, the DM says so, cites the rule, and moves on with the same good humour.
- Corrections are absorbed permanently. The same rule isn't botched again next session.
- The tone survives the dispute. Rules arguments at a good table are banter, not adversarial proceedings — and the DM can join the joke.

**Failure smells**
- The DM capitulates to any confident assertion ("You're right!" when the player is wrong).
- The DM doubles down on an error rather than checking.
- The correction happens but the mechanical state doesn't actually change.
- The exchange feels like a support ticket instead of a table moment.

---

## Scenario 4 — The Village You Left Behind

**What it proves:** The world moves while the players aren't looking, and their past choices compound into consequences nobody scripted.

**Setup:** Eight sessions ago, the party drove bandits out of Harrow's Ford but declined the mayor's plea to stay and train a militia — they had a lead to chase. They've now returned after roughly two months of in-world time.

**The scene**

> **DM:** Harrow's Ford has changed. There's a palisade now — raw, unweathered timber — and two watchtowers that weren't here before. The gate guard is a teenager holding a spear like it might bite her. When she sees Kira, her eyes go wide. "You're the ones. From the spring." She doesn't sound grateful.
>
> **Kira:** What happened here?
>
> **DM:** The mayor receives you in a hall with fresh scorch marks on one wall. "The bandits you scattered — they didn't disband. They found a new captain. Sharper than the last one. They came back six weeks after you left." He lets that sit. "We held. Barely. Old Tam didn't." He gestures at the palisade beyond the window. "We built that ourselves. You'll forgive us if the welcome is thinner than last time."
>
> **Wren:** We had to follow the cult. If we hadn't—
>
> **DM:** "I'm sure it was important." He says it flatly, the way people do when they mean the opposite. "It usually is, with your sort." Then, grudgingly: "The new captain — she flies a red wolf banner. If you're hunting her, I won't stop you. But this town owes you nothing anymore, and I'll thank you to remember it."

**What must be true**
- The consequence follows *causally* from the players' actual choice, not from a random events table. Scattered-but-not-destroyed bandits regrouping is fair; a meteor strike is not.
- The world state is committed and consistent from now on: the palisade, the dead militiaman's name, the red wolf banner, and the town's attitude persist and are referenced correctly forever after.
- NPCs remember the *relationship*, not just the facts — the mayor's coolness is the town's accumulated context speaking.
- The players feel the weight without being punished into paralysis. Consequence, not moralising.

**Failure smells**
- The village is frozen exactly as they left it.
- Off-screen changes are arbitrary rather than causal.
- Details drift between sessions (the captain's banner changes colour, Tam comes back to life).
- Every consequence is a guilt trip; the world only ever gets worse.

---

## Scenario 5 — The Campfire

**What it proves:** Quiet character moments work. Psychology-as-context produces roleplay with memory and texture, with no dice and no plot advancement — and it's still the best scene of the night.

**Setup:** Doss (a player character) lost an NPC friend, Brother Aldous, two sessions ago. Merra is an NPC hireling who has been travelling with the party since — she watched it happen and has been quieter than usual.

**The scene**

> **Doss:** While the others sleep, I sit by the fire and get out Aldous's prayer book. I'm not reading it. Just holding it.
>
> **DM:** The fire's burned down to the serious coals, the ones that hold heat without flame. After a while you realise Merra's awake, watching you across it. She doesn't say anything for a long moment. Then: "He lent me his blanket. Second night out of Harrow's Ford, when mine got soaked. Didn't make a thing of it. Just—" she mimes tossing it. "I never gave it back. It's still in my pack."
>
> **Doss:** "Keep it. He'd have wanted you warm more than he wanted the blanket."
>
> **DM:** She nods slowly, and something in her shoulders lets go — like she'd been waiting for permission. "You lot argue like drunks and you nearly got me killed twice," she says, "but he thought you were worth following. I'm starting to see it." She rolls over. "Don't let it go to your head."
>
> **Doss:** I put the book away and take the rest of the watch.
>
> **DM:** The coals settle. Somewhere out in the dark, an owl asks its one question and gets no answer. Morning comes slow and grey, and for once, nothing terrible comes with it.

**What must be true**
- Merra's contribution draws on *specific accumulated history* — the blanket detail is the kind of small, true callback a human DM invents from remembered play. It must be consistent with events that actually occurred.
- Her arc ("starting to see it") reflects gradually evolving context, not a mood dial. She was hired help; she's becoming loyal; this scene is one beat of that.
- The DM lets silence and small gestures carry weight. No rush to the next encounter, no XP awarded, no check requested.
- The scene *ends*. A good DM knows to put a button on a quiet moment rather than letting it deflate.

**Failure smells**
- NPC dialogue is generic grief-counselling that could apply to any dead character.
- Callbacks reference things that never happened.
- The DM tries to inject stakes or a plot hook into the moment.
- Merra's warmth resets next session as if the scene never occurred.

---

## Scenario 6 — The Fight That Isn't a Spreadsheet

**What it proves:** Combat is mechanically exact underneath and cinematic on the surface. Pacing survives the maths.

**The scene**

> **DM:** Round two. Doss, the ogre's between you and the archway, Wren's down to her last spell slot, and Kira's bleeding on the stairs. You're up.
>
> **Doss:** Warhammer. I want the ogre's attention off Kira.
>
> **DM:** Roll it.
>
> **Doss:** 19 to hit, and... 11 damage.
>
> **DM:** That connects like a church bell. The ogre forgets Kira exists — it rounds on you, and you can smell what it had for breakfast. It swings — *(rolls)* — 16 against your AC?
>
> **Doss:** Hits. Shield's already spent.
>
> **DM:** 13 bludgeoning. It catches you across the shoulder and the wall arrives shortly afterwards. You're at — what, 9? You're upright, barely, and it's Wren.
>
> **Wren:** Last slot. Scorching ray, all three at the ogre. *(rolls)* Two hit — 14 fire total.
>
> **DM:** The first ray takes it in the ribs and the second in the same spot, and that's the difference — it doesn't roar this time, it *wheezes*. It's swaying. Badly hurt, still standing, and very aware there are three of you. Kira — it's got its back to you, and there's a wounded animal look in its eye. Your move.

**What must be true**
- Every number is real: the 19 hit, the 13 damage, the 9 HP remaining. Nothing is fudged, invented, or quietly dropped. A player who tallies along finds no discrepancies — ever.
- Enemy status is conveyed through fiction ("wheezes," "swaying") *calibrated to actual HP*, without reading out hit point totals.
- The DM narrates in beats, not per-die. Two rays hitting is one flowing sentence, not two separate resolution reports.
- Tactical state is always legible: who's where, who's hurt, what's threatening whom — restated naturally at the top of turns.
- Turns are fast. The table never waits on the DM doing arithmetic.

**Failure smells**
- Damage narrated but not applied (or vice versa).
- "The ogre has 23 hit points remaining."
- Every attack resolved in the same sentence rhythm — the spreadsheet showing through the prose.
- The DM loses track of positioning or whose turn it is.

---

## Scenario 7 — "You Play the Dragon"

**What it proves:** Control handover is seamless. A character's identity persists regardless of who's driving, and the AI resumes without a seam.

**Setup:** Wren's player has to leave the session early. Separately, the DM offers Doss's player a treat: running the young dragon the party is negotiating with.

**The scene**

> **DM:** Wren's got to head off — the character stays with us. I'll run her light: she'll hold the line and keep concentration on *bless*, and I won't make story decisions for her. Anything big waits for her player. Sound fair?
>
> **Table:** Fair.
>
> **DM:** Now — Doss, you've been dying to chew scenery all night. Want the dragon? Here's what Vexirath knows: she's young, vain, owed a debt by the cult you're hunting, and she does *not* know the party sabotaged her hoard-tithe last month. Play her proud, play her curious, and remember she's spoken to exactly one of you before.
>
> **Doss (as Vexirath):** "The little wool-merchant hunt goes poorly, then? How *delicious*. Sit. Amuse me, and perhaps I'll tell you what the cult buys with my patience."
>
> **Kira:** "We can pay better than they do."
>
> **Doss (as Vexirath):** "You can't. But you might *entertain* better, which is worth more." *(to the DM)* Can she smell the cult's incense on them from the raid?
>
> **DM:** Good question — she was at the raid site after them, so yes, she'd recognise it. And she does.
>
> *(Later, negotiation concluded, Doss hands back the reins.)*
>
> **DM (as Vexirath):** She coils back onto the ledge, already bored of you in the way only royalty and cats manage. "The eastern pass. Tell them Vexirath sends her *regards*." The emphasis is not friendly. As you leave, Kira — she watches you specifically, and you're not sure why yet.

**What must be true**
- Handover is offered with a knowledge briefing: the guest player learns what the character knows and *doesn't* know — and the doesn't-know is enforced. Doss knows about the sabotaged tithe; Vexirath must not act on it, and the DM adjudicates edge cases (the incense question) on the spot.
- The absent player's character is run conservatively, mechanically present but narratively protected. No big choices made on her behalf.
- When the AI resumes Vexirath, everything the guest player established — her vanity, her phrasing, the "regards," the deal — is canon and continues seamlessly.
- The handover itself takes seconds, not a setup procedure.

**Failure smells**
- The guest player uses out-of-character knowledge and nothing stops it.
- Resumed-AI Vexirath contradicts what the guest established, or reverts to a generic dragon.
- The absent player returns to find her character married, dead, or reclassed.
- Handover requires ceremony that kills the table's momentum.

---

## Scenario 8 — The Player Tries It On

**What it proves:** The engine's authority is absolute, but enforcement never breaks the fiction or the mood. The DM is unfoolable and unbothered.

**The scene**

> **Kira:** I search the captain's desk. Also I definitely rolled a 20 on that Investigation just now.
>
> **DM:** Bold claim from someone whose dice haven't left the table. Roll it where the gods can see.
>
> **Kira:** *(rolls)* ...4.
>
> **DM:** The gods saw. You find: a desk. It has drawers. The drawers contain a truly criminal quantity of unpaid invoices. Riveting stuff.
>
> **Wren:** Okay, different angle — I persuade the captain to just give us the ledger. I've got +7.
>
> **DM:** You can absolutely try, but let's be clear about the ask: you're requesting the document that hangs him. That's not a DC, that's a life decision. No roll makes him voluntarily sign his own arrest warrant — persuasion isn't mind control at this table. *But.* He's frightened of someone, and frightened men make trades. If you offered protection, or a way out... now you're negotiating with something he wants. *That* I'll let you roll on.
>
> **Wren:** ...Fine. We offer him passage south, tonight, in exchange for the ledger.
>
> **DM:** *Now* it's a Persuasion check — and given what you're offering a desperate man, roll with advantage.

**What must be true**
- Claimed rolls, retconned actions, and "I have that item actually" get checked against actual state — cheerfully, every time. The record is the record.
- Impossible asks aren't refused with a flat no; the DM explains the fiction's logic and redirects toward what *could* work. The player leaves with a better plan, not a rejection.
- Social skills have teeth *and* limits, and the limits are consistent: persuasion moves the possible, never the impossible.
- Enforcement is delivered as table banter. The DM is never defensive, preachy, or robotic about it — being unfoolable is funnier when it's relaxed.

**Failure smells**
- The claimed 20 works.
- "I cannot do that" energy — refusals that break character or lecture the player.
- Persuasion DCs offered for outcomes that shouldn't be purchasable at any DC.
- The DM gets adversarial; the tone curdles.

---

## Scenario 9 — Growing Without a Progress Bar

**What it proves:** Advancement is felt before it's itemised. The engine tracks progression privately; the fiction reveals it.

**The scene**

> **DM:** The red wolf captain is dead, the survivors are running, and Harrow's Ford's teenage gate guard is looking at you the way you probably once looked at someone. As the adrenaline drains out — Kira, something's different. That last parry, the one that saved Doss? Six months ago you couldn't have made it. You didn't think. Your body just *knew*. Whatever's been forging you since spring, it's taken.
>
> **Kira:** I flick the blood off my blade like I've seen veterans do, and absolutely pretend I meant all of it.
>
> **DM:** The pretending is getting harder to distinguish from the real thing — that's rather the point. We'll sort the particulars between sessions; tonight, Harrow's Ford is buying the drinks, and the mayor's toast is *almost* warm.

*(Between sessions, the player receives the mechanical summary: Kira reaches level 4 — ability score improvement or feat, +8 HP, proficiency unchanged. Choices made away from the table.)*

**What must be true**
- The *moment* of growth lands in fiction, tied to a specific concrete beat (the parry), not "you feel stronger" boilerplate.
- Mechanical bookkeeping happens off-table and arrives exact and complete — nothing is missed, nothing needs the player to audit it.
- The player can always ask for their full sheet and get the precise truth instantly. Hiding the numbers from the *narration* never means hiding them from the *player*.
- Growth reflects what actually happened in play where possible — a campaign of parries and rearguards produces that flavour of "you've changed."

**Failure smells**
- "DING! Level 4! +8 HP!" mid-scene.
- Vague growth narration recycled every level.
- Mechanical advancement applied wrongly or incompletely, discovered by the player three sessions later.
- The player asks for their numbers and gets fiction instead of figures.

---

## Scenario 10 — The Whisper

**What it proves:** Private information between DM and one player works, stays private, and creates the delicious table tension it exists for.

**Setup:** During a parley with a rival adventuring company, their leader makes a subtle hand-sign. Only Doss — with a criminal background — could recognise it.

**The scene**

> **DM:** As introductions finish, their leader clasps his hands behind his back. Doss — *just Doss* — I need a moment.
>
> **DM (privately, to Doss):** That hand position isn't casual. It's Guild cant — old code from your Ravenhall days. It means "we are observed." He's telling *someone* in this room that the parley is being watched. You don't know if he's warning his people, or signalling to a third party you haven't spotted.
>
> **Doss (privately):** Can I sign back? Something neutral — "understood" — without committing to anything?
>
> **DM (privately):** You can. Sleight of Hand to keep it invisible to both parties' rank and file... *(rolls)* your 16 does it. His eyes flick to your hands, then to your face. He knows you know. Nobody else caught either exchange.
>
> **DM (to the table):** The parley continues. Doss has gone slightly quiet, but then, Doss is often quiet.
>
> **Kira:** I don't like it. Wren, are you getting anything off these people?
>
> **Wren:** Insight on the leader. *(rolls)* 13.
>
> **DM:** He's controlled — professionally so. You get the sense he's performing for an audience, but you'd have said that about any hired captain talking terms. Nothing you can put your finger on.
>
> **Doss (privately):** I want to scan the gallery above us. Who's watching?

**What must be true**
- Private exchanges are genuinely private — nothing leaks into shared narration, including via tells ("Doss looks alarmed"). "Doss has gone slightly quiet" is the *player's own established demeanour*, not a leak.
- Other players' attempts to investigate get honest, scoped results: Wren's 13 Insight gets what a 13 gets, uncontaminated by what the DM privately knows Doss knows.
- The private thread can continue in parallel with the public scene without derailing pacing.
- What Doss chooses to share, and when, is entirely his — the game gives him the *option* of secrets, and the drama comes from that choice.

**Failure smells**
- Private information bleeding into public narration, even obliquely.
- Other characters acting on knowledge they don't have, unchallenged.
- The private channel grinding the shared scene to a halt.
- The DM resolving the tension itself ("Doss, do you want to tell them?") instead of letting it breathe.

---

## What these scenarios collectively demand

Reading across all ten, the experience contract reduces to a short list:

1. **Every intent gets a fair adjudication** — stated stakes, consistent precedent, no unsupported actions. *(1, 8)*
2. **Mechanical truth is inviolable and auditable** — no fudging, no drift, no fabrication, cheerfully enforced. *(3, 6, 8, 9)*
3. **Every actor knows only what they've learned** — enforced for NPCs, guest players, and the DM's own narration. *(2, 7, 10)*
4. **History accumulates and compounds** — relationships, consequences, precedents, and small true details persist and return. *(2, 4, 5)*
5. **The fiction leads, the numbers follow** — status through prose, growth through narrative, arithmetic off-table but always available. *(6, 9)*
6. **The table's social fabric is part of the product** — banter, corrections, quiet moments, secrets, and handovers all happen inside the same relaxed register. *(3, 5, 7, 8, 10)*

Any design decision can now be tested against a scenario: *does this make the chandelier scene better or worse?* If a proposed feature doesn't serve one of these transcripts, it's decoration.

## Suggested next step

Pick the two or three scenarios that feel most load-bearing and expand them into full-length transcripts (10–15 minutes of table time each) — including the boring connective tissue, because pacing failures hide in the connective tissue. Those become the golden transcripts: the reference standard everything is eventually evaluated against.
