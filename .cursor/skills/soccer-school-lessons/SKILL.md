---
name: soccer-school-lessons
description: >-
  Author and edit Soccer School quiz lessons in the .lesson command language.
  Use when creating, converting, or changing a lesson, .lesson file, lineup,
  field drawing, quiz question, or anything under src/lessons/.
---

# Soccer School lessons

A **course** is a folder of lessons and scores as one run. A lesson is **one file, one play**. A play can ask **one or more questions** on the same moment. Do not add plays in TypeScript. Copy a similar file in `src/lessons/<course>/` and edit it.

Glob load: `src/lessons/**/*.lesson` via `src/lesson/load.ts`. A parse error crashes app load.

**Path is identity:** `src/lessons/<course>/<name>.lesson`

- Folder = course (`names`, `ball-out`, `goalie-hands`, `fouls`)
- File name (no `.lesson`) = lesson id, e.g. `throw-in-to-goalie.lesson`

Do not put `course` or `id` in the file.

## File shape

```
title Over the sideline
intro Blue has the ball near the side.
flip vertical          # optional; mirrors y
hide names             # optional; hide pitch labels
hide ball              # optional

setup
  lineup 7v7
  player B-RF at 56.7, 51.7
  ball with B-RF

step
  caption Blue has the ball near the sideline.

step
  caption Blue kicks it — all the way over the sideline!
  ball to 71.4, 73.4
  arrow from B-RF to ball
  draw sideline bottom
  duration 1450

question
  prompt Who gets the ball?
  answer Red
  wrong Blue
  wrong Nobody
  wrong Play on
  correct Red's ball.
  why Blue last touched it over the sideline, so Red throws it in.

question
  prompt What restart is it?
  answer Throw-in
  wrong Goal kick
  wrong Corner
  wrong Kick-off
  correct Throw-in.
  why Over the sideline, the other team throws it back in.
```

`#` starts a comment. Indentation is optional. `#` to end of line.

**Order:** header → optional `setup` → one or more `step` → one or more `question`. At least one `step` must come **before** the first question, and a `step` after a `question` is a parse error — the lesson ends on the last answer and the app moves straight to the next question.

## Header

| Command | Notes |
|---|---|
| `title <text>` | Shown as the play title |
| `intro <text>` | Shown under the title |
| `flip vertical` | Random 50% y-mirror in a session |
| `hide names` | Hide "Your goal" / sideline labels |
| `hide ball` | Hide the ball (name-the-field) |

New course: add the slug to `COURSE_IDS` in `src/types.ts`, a folder `src/lessons/<course>/`, and a card in `src/data/courses.ts` (clear `comingSoon` if it was a placeholder).

## Coords

- Metres. Pitch is **105 × 68**. Origin: left = your goal (`x = 0`), top sideline (`y = 0`).
- Off-field is allowed (`y > 68`, `x < 0`).
- Keep ~**8 m** between marking players so the ball fits; parser warns under **6 m**.
- Default move ~800 ms; kicks/passes use `duration 1100`–`1450`.

## Tags

`[color]-[role]`. Color `B` (you / blue) or `R` (them / red). Goalie is keeper automatically.

`lineup 7v7` places:

- Blue: `B-G` (6, 34), `B-LB` (24, 12), `B-CB` (22, 34), `B-RB` (24, 56), `B-CM` (42, 34), `B-LF` (58, 22), `B-RF` (58, 46)
- Red (x-mirrored, roles flipped L/R): `R-G`, `R-RB`, `R-CB`, `R-LB`, `R-CM`, `R-RF`, `R-LF`

`player TAG at x, y` overwrites a lineup player or adds one.

## Setup

```
lineup 7v7
player B-RF at 56.7, 51.7
ball with B-RF
ball at 33.6, 21.8
```

## Steps (patches only)

Unmentioned players stay put. Drawings and arrows are **per-step** (repeat them if they should stay). Positions, labels, and `hands` persist.

The first step's caption is the lead-in. If several lessons in a course share a **byte-identical** lead-in caption, only the first one in a session speaks it — that is how a course gives a one-time instruction (`Look at the field. One part will glow yellow.`) without repeating it every play. Do not restate that instruction in the later steps.

| Command | Notes |
|---|---|
| `caption <text>` | Spoken while the step animates; keep it kid-simple |
| `TAG to x, y` | Move a player |
| `ball to x, y` / `ball with TAG` | Independent ball vs possession |
| `arrow from <TAG\|ball\|x, y> to <TAG\|ball\|x, y>` | Teaching/kick arrow |
| `draw …` | Yellow overlay (below) |
| `label TAG text` | One character stays on the token; longer text floats above the player and fades |
| `banner text` | Center overlay ("Throw-in") |
| `duration ms` | Move animation only |
| `hands TAG` | Goalie gloves |
| `no-hands TAG` | Slash on **that** player this step |

## Draw

Named (prefer these):

```
draw sideline top|bottom
draw goal-line left|right
draw penalty-area left|right
draw goal-area left|right
draw halfway-line
draw center-circle
draw penalty-spot left|right
```

Generic: `draw line x1, y1 to x2, y2` · `draw rect x, y, w, h` · `draw circle x, y r radius`

## Question

Exactly: `prompt`, one `answer`, three `wrong`, `correct`, `why`. Choices are shuffled at runtime.

**`correct` — shown on screen on a hit.** The voice only says a short random opener ("That's right." / "You got it." / "Nice one."), so this line is read, not heard, and the answer is never restated out loud. Rules:

- Short and sharp. One clause, no teaching, no "because".
- Do not write an opener into it; the voice already said one.
- Do not echo a yes/no choice ("Yes" / "No"). State the fact: `correct She can use her hands there.`

**`why` — spoken on a miss only.** This is where the teaching goes: one sentence saying what actually happens and why.

**Two beats on one moment = two `question` blocks in the same file**, back to back with no `step` between them (see `ball-out/throw-in-blue-out.lesson`: who gets the ball, then what restart). The clip does not replay between them; the second prompt is just asked over the same frozen frame. Only split into separate files when the second beat needs its own animation.

## Audience

Kids ~8–10. You are blue. Captions, `correct`, and `why` should be short and concrete.

## After writing

1. `pnpm type-check` — import of a bad file throws at load.
2. Run the app, open that course, confirm the play starts, and answer both while the clip is still running and after it finishes.

Templates: action play → `src/lessons/ball-out/throw-in-blue-out.lesson`. Field names → `src/lessons/names/name-sideline.lesson`. Goalie → `src/lessons/goalie-hands/hands-ok.lesson`.
