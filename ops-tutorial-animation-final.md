# OPS Pre-Tutorial Animation — Final Implementation Spec

## Overview

When a new user taps GET STARTED on the landing page, they enter a guided animated introduction that teaches core concepts before dropping them into a hands-on interactive tutorial. The entire intro is automatic — the user watches short animations, confirms understanding at two checkpoints, then proceeds.

## Design Principles

- **Apple onboarding alignment.** One idea per moment. Motion is the explanation. Progressive disclosure. No chrome.
- **OPS visual language.** Dark background (OPS dark). All graphics white stroke, no fill. Tactical/military minimalism.
- **Text is above the animation container.** Messages live in their own clean space. They do not overlay the animation.
- **ALL CAPS** for all messages. Typewriter animation for primary messages.
- **Pacing gives weight.** Slow = important. Fast = "you get it." The bell curve timing teaches pattern recognition.
- **Responsive.** Works portrait (mobile) and landscape (web). Centered composition.
- **No progress indicators.** No step counts, no progress bars. Checkpoints are the only UI.

---

## Color Definitions

### Status Colors

Reference `opsStyleStatus.[status]` for each:

- RFQ
- Estimated
- Accepted
- In Progress
- Completed
- Closed
- Archived

### Task Colors

- **Task 1:** Bone white / cream
- **Task 2:** Burnt orange
- **Task 3:** Sage green

### Default / Inactive State

- All inactive elements: desaturated white/gray stroke
- Dark background (OPS dark)

---

## Sample Data

### Client & Project

- **Client:** Charlie Blackwood
- **Project:** Office Remodel

### Tasks

| Task | Name | Color | Crew | Count | Date |
|------|------|-------|------|-------|------|
| Task 1 | Sanding | Bone white / cream | Maverick | 1 | Mar 12 |
| Task 2 | Priming | Burnt orange | Goose | 1 | Mar 15 |
| Task 3 | Painting | Sage green | Iceman | 1 | Mar 18 |

---

## Animation Sequence

### Sequence 1 — Projects Contain Tasks

**Message:** PROJECTS ARE BUILT OF TASKS
**Message appears:** After tasks finish stacking (typewriter animation)
**Message fades out:** When Sequence 1B message types in

1. A white project folder icon (stroke, no fill) fades into the center of the screen.
2. After a brief pause (~1s), the folder opens — a subtle lid-lift animation.
3. Three smaller task folder icons spring upward out of the project folder, stacking into a **left-aligned vertical column** above it. The project folder shifts downward to make room. The task folders appear one at a time with a slight stagger. All three are **grayscale/desaturated, uniform small size**.
4. Message types in above the animation container.
5. After a short hold, the screen automatically advances to Sequence 1B.

---

### Sequence 1B — Tasks Have Crew and Dates

**Message:** EACH TASK GETS A CREW AND A DATE
**Message appears:** Before Task 1 highlights (typewriter animation)
**Message fades out:** After Task 3 retracts, before tasks collapse back into folder

For each task (top to bottom, sequentially, same duration per task):

**Step 1 — Select**
- Task folder shifts slightly to the left.
- Transitions from grayscale to **its unique task color** (stroke/lines only).
- Other task folders remain grayscale.

**Step 2 — Reveal details**
- To the **right** of the selected task folder, the following slides in — **all rendered in that task's color**:
  - Task label (e.g., "SANDING")
  - Crew member avatar (sample data — Maverick/Goose/Iceman) + crew icon with count
  - Schedule icon + date (e.g., "Mar 12")
- Layout references iOS app project card information hierarchy.

**Step 3 — Hold**
- ~1.5s for user to read.

**Step 4 — Deselect**
- Adjacent details retract / fade away.
- Task folder shifts back to position and **returns to grayscale**.

**Step 5 — Next task**
- Next task folder down repeats Steps 1–4 with its own color and sample data.

**Task sequence:**

| Order | Task | Color | Details |
|-------|------|-------|---------|
| 1 | Task 1 | Bone white / cream | SANDING — Maverick — 1 — Mar 12 |
| 2 | Task 2 | Burnt orange | PRIMING — Goose — 1 — Mar 15 |
| 3 | Task 3 | Sage green | PAINTING — Iceman — 1 — Mar 18 |

**Collapse:**

After all 3 tasks have cycled:
1. Message fades out.
2. All three task folders collapse back into the project folder — they shrink and converge toward the folder's center in **reverse order** (bottom task first, then middle, then top).
3. The project folder rises back to its original centered position and closes.
4. Screen pauses at Checkpoint 1.

---

### ⏸ Checkpoint 1

**Message:** GOT IT SO FAR?
**Message appears:** With buttons
**Message fades out:** When user taps Got It

Two buttons appear at the bottom of the screen:

- **GOT IT** — continues to Sequence 1C
- **BACK** — replays Sequences 1 and 1B from the beginning

---

### Sequence 1C — Building a Project

**Message:** A PROJECT TAKES 30 SECONDS TO BUILD
**Message appears:** Before details begin building (typewriter animation)
**Message fades out:** After details collapse and label settles on folder

1. Project folder (centered, white stroke) **scales down** to make room above it.
2. Details appear above the folder, building top-down as a list:
   - **OFFICE REMODEL** types in first (project name — top of list)
   - **CHARLIE BLACKWOOD** types in (client name)
   - **Address** types in (sample address)
   - **Photo thumbnails** appear (white stroke camera/image icons, 2–3 small frames)
   - **+ TASK 1: SANDING** animates in
   - **+ TASK 2: PRIMING** animates in
   - **+ TASK 3: PAINTING** animates in
3. Brief hold — user sees the full anatomy of a project being built.
4. Details **collapse back into the folder** from bottom up — tasks first, then photos, address, client name.
5. **OFFICE REMODEL collapses last** (it was top of the list) and settles as a **centered label on the project folder**. Folder scales back up to normal centered size.
6. A subtitle appears beneath the folder: task icon + **"3"** adjacent.

**"OFFICE REMODEL" label persists on the folder for the remainder of the entire animation.**

**→ Flows directly into Sequence 2 (no checkpoint)**

---

### Sequence 2 — Project Status Lifecycle

**Message 1:** EVERY PROJECT HAS A STATUS
**Message 1 appears:** When carousel appears (typewriter animation)
**Message 1 fades out:** When carousel reaches Closed, before reverse roll begins

**Message 2:** CHANGE IT ANYTIME
**Message 2 appears:** After reverse roll settles on Estimated
**Message 2 fades out:** Before archive label fades in

**Message 3:** ARCHIVE WHAT DOESN'T MOVE FORWARD
**Message 3 appears:** When archive label appears ("ARCHIVE" highlighted in archive color)
**Message 3 fades out:** After folder returns to center, before Sequence 3

#### Setup

1. Project folder is centered with "OFFICE REMODEL" label. Any previous text/subtitle clears.

#### Status Carousel

2. A **horizontal carousel** appears above the folder:
   - **Center position:** Active status — full `opsStyleStatus.[status]` color, full opacity
   - **Left position:** Previous status — desaturated white/gray, reduced opacity (~0.3–0.4)
   - **Right position:** Next status — desaturated white/gray, reduced opacity (~0.3–0.4)
   - Only immediate neighbors visible. Statuses beyond are hidden.

3. Carousel begins with **RFQ** centered. Folder adopts `opsStyleStatus.rfq` color.

#### Forward Progression

Each transition: carousel row slides left. Incoming status enters from right (desaturated), crosses to center, **saturates into its status color** as it arrives. Folder color transitions simultaneously. All transitions use a **spring modifier** — slight overshoot and settle on landing.

**Haptic feedback** fires on each status arrival (mobile). Visual pulse (brief scale bump on folder) as universal fallback for web.

#### Timing — Bell Curve with Spring

| Transition | Duration | Feel |
|-----------|----------|------|
| RFQ → Estimated | ~1.8s | **Slow** — first transition, user learns the mechanic |
| Estimated → Accepted | ~1.2s | **Medium** — picking up pace |
| Accepted → In Progress | ~0.6s | **Fast** — spring most visible, snappy |
| In Progress → Completed | ~1.2s | **Medium** — decelerating |
| Completed → Closed | ~1.8s | **Slow** — settling, signaling conclusion |

#### Reverse Roll

6. On Closed — hold (~1s). Message 1 fades out.
7. Carousel **reverses rapidly** back through all statuses: Closed → Completed → In Progress → Accepted → Estimated. Quick, fluid, continuous. Colors cycle in reverse. Settles on **Estimated** with `opsStyleStatus.estimated` color.
8. Message 2 appears: **CHANGE IT ANYTIME**

#### Archive

9. Message 2 fades out.
10. Message 3 appears: **ARCHIVE WHAT DOESN'T MOVE FORWARD** ("ARCHIVE" in archive color).
11. **"ARCHIVED"** label appears below the folder.
12. Folder shifts downward toward the Archived label, shrinks slightly, turns `opsStyleStatus.archived` color.
13. After a pause, the folder **returns to white** and **rises back to center**. Archive label and Message 3 disappear.
14. Folder holds centered — Sequence 3 picks up from here.

**Note:** No zoom-through at end of Sequence 2. That moves to the finale of Sequence 3.

During Sequence 2, a **BACK** button is available at the bottom to return to Sequence 1 at any time.

---

### Sequence 3 — Completing a Project

**Message 1:** COMPLETE TASKS. COMPLETE THE PROJECT.
**Message 1 appears:** When tasks emerge (typewriter animation)
**Message 1 fades out:** After tasks collapse and project status rotates to Completed

**Message 2:** GET PAID. CLOSE IT OUT.
**Message 2 appears:** When invoice appears
**Message 2 fades out:** After invoice collapses into folder

**No message during zoom-through — let it breathe.**

**Message 3:** NOW TRY IT YOURSELF
**Message 3 appears:** After zoom-through, centered on screen
**Message 3 fades out:** When user taps Begin Tutorial or Skip (persists through Checkpoint 2)

#### Status Arrival

1. Project folder is centered with "OFFICE REMODEL" label (persisted since Sequence 1C).
2. Status carousel **reappears** above the folder. Carousel spins and **settles on IN PROGRESS**. Folder transitions to `opsStyleStatus.inProgress` color.

#### Tasks Emerge and Complete

3. Folder opens. Three task folders emerge into their vertical stack. All grayscale.
4. **Task 1** (cream) — a checkmark appears on it, then fades to `opsStyleStatus.completed` color.
5. **Task 2** (burnt orange) — same animation, **same speed** as Task 1.
6. **Task 3** (sage green) — same animation, **same speed** as Task 1.

#### Project Completes

7. Tasks collapse back into the folder.
8. Status carousel above still shows **IN PROGRESS**, then **rotates to COMPLETED**. Folder transitions to `opsStyleStatus.completed` color simultaneously.
9. Message 1 fades out.

#### Payment

10. Completed status label **fades out**. Folder remains completed color.
11. **Invoice icon** appears above the folder — white stroke rectangle with a **dog-eared corner**. Message 2 appears.
12. A **checkmark stamps onto the invoice**. Brief hold.
13. Invoice and checkmark **collapse into the project folder**. Message 2 fades out.

#### Close

14. Status carousel **reappears**, showing Completed, then **rotates to CLOSED**. Folder transitions to `opsStyleStatus.closed` color simultaneously.

#### Finale

15. Status label disappears. All remaining page content disappears.
16. **Zoom-through** — folder scales up dramatically and fades away.
17. **NOW TRY IT YOURSELF** appears centered on screen.

---

### ⏸ Checkpoint 2

**Message:** NOW TRY IT YOURSELF (persists from Sequence 3 finale)
**Message fades out:** When user makes a selection

Two buttons appear:

- **BEGIN TUTORIAL** — takes the user into the hands-on interactive tutorial
- **SKIP** — bypasses the interactive tutorial and goes directly to account signup

---

## After the Interactive Tutorial

Once the user completes the hands-on walkthrough, they see a completion screen showing how long it took them (e.g., "DONE IN 47s. NOT BAD." or "YOU'RE READY."), along with the message "Now build your first real project and run your crew right." A **LET'S GO** button takes them into the signup flow.

---

## Message Summary

| # | Message | Appears | Fades Out |
|---|---------|---------|-----------|
| 1 | PROJECTS ARE BUILT OF TASKS | Seq 1: after tasks stack | When Seq 1B message types in |
| 2 | EACH TASK GETS A CREW AND A DATE | Seq 1B: before Task 1 highlights | After Task 3 retracts, before collapse |
| 3 | GOT IT SO FAR? | Checkpoint 1: with buttons | When user taps Got It |
| 4 | A PROJECT TAKES 30 SECONDS TO BUILD | Seq 1C: before details build | After details collapse and label settles |
| 5 | EVERY PROJECT HAS A STATUS | Seq 2: when carousel appears | When carousel reaches Closed |
| 6 | CHANGE IT ANYTIME | Seq 2: after reverse roll settles on Estimated | Before archive label fades in |
| 7 | ARCHIVE WHAT DOESN'T MOVE FORWARD | Seq 2: when archive label appears | After folder returns to center |
| 8 | COMPLETE TASKS. COMPLETE THE PROJECT. | Seq 3: when tasks emerge | After project status rotates to Completed |
| 9 | GET PAID. CLOSE IT OUT. | Seq 3: when invoice appears | After invoice collapses into folder |
| 10 | NOW TRY IT YOURSELF | Seq 3: after zoom-through | When user taps Begin Tutorial or Skip |

---

## Technical Notes

- **Haptic:** Fire where available (mobile). Degrade silently on web. Substitute subtle visual pulse (scale bump) as universal feedback.
- **Back at checkpoints:** Replays the previous sequence group from the top. Not frame-scrub.
- **Back during Sequence 2:** Available throughout, returns to Sequence 1.
- **Spring values:** Tension and damping defined at build time. Target feel: tactile, not bouncy. Controlled snap.
- **Responsive:** All elements scale proportionally. Column layouts and carousel adapt to viewport.
- **Photos attach to projects**, not individual tasks.
- **"OFFICE REMODEL" label persists** on the project folder from Sequence 1C through the end of Sequence 3.

---

## Sequence Flow

```
SEQ 1     Folder opens → tasks stack vertically
          "PROJECTS ARE BUILT OF TASKS"
               ↓
SEQ 1B    Each task highlights → shows crew/date → deselects → next
          "EACH TASK GETS A CREW AND A DATE"
          Tasks collapse back into folder
               ↓
     ⏸ CHECKPOINT 1
          "GOT IT SO FAR?"
          [GOT IT] / [BACK]
               ↓
SEQ 1C    Folder scales down → details build above (project name, client,
          address, photos, tasks) → collapse into folder → "OFFICE REMODEL"
          persists as label → task count subtitle
          "A PROJECT TAKES 30 SECONDS TO BUILD"
               ↓
SEQ 2     Status carousel forward (bell curve: slow→med→fast→med→slow)
          "EVERY PROJECT HAS A STATUS"
          Reverse roll to Estimated
          "CHANGE IT ANYTIME"
          Archive drag down → return to center
          "ARCHIVE WHAT DOESN'T MOVE FORWARD"
               ↓
SEQ 3     Carousel lands on In Progress → tasks emerge →
          complete one by one (same speed each) → collapse →
          project rotates to Completed
          "COMPLETE TASKS. COMPLETE THE PROJECT."
          Invoice + checkmark → collapse into folder
          "GET PAID. CLOSE IT OUT."
          Status rotates to Closed → everything clears → zoom-through
          "NOW TRY IT YOURSELF"
               ↓
     ⏸ CHECKPOINT 2
          [BEGIN TUTORIAL] / [SKIP]
```
