---
name: soccer-school-lessons
description: >-
  Author and edit Soccer School quiz lessons in the .lesson command language.
  Use when creating, converting, or changing a lesson, .lesson file, lineup,
  field drawing, quiz question, or anything under src/lessons/.
---

# Soccer School lessons

Lessons are **one file, one question**. Do not add plays in TypeScript. Copy a similar file in `src/lessons/<group>/` and edit it.

Glob load: `src/lessons/**/*.lesson` via `src/lesson/load.ts`. A parse error crashes app load.

**Path is identity:** `src/lessons/<group>/<name>.lesson`

- Folder = group (`names`, `ball-out`, `goalie-hands`, `fouls`)
- File name (no `.lesson`) = lesson id, e.g. `throw-in-to-goalie.lesson`

Do not put `group` or `id` in the file.

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
  why Blue touched it last over the sideline, so Red gets the ball.

step
  caption Red throws it back onto the field.
  ...
```

`#` starts a comment. Indentation is optional. `#` to end of line.

**Order:** header → optional `setup` → one or more `step` → exactly one `question` → optional more `step`s (shown after the answer). At least one `step` must come **before** the question.

## Header

| Command | Notes |
|---|---|
| `title <text>` | Shown as the play title |
| `intro <text>` | Shown under the title |
| `flip vertical` | Random 50% y-mirror in a session |
| `hide names` | Hide "Your goal" / sideline labels |
| `hide ball` | Hide the ball (name-the-field) |

New group: add the slug to `GROUP_IDS` in `src/types.ts`, a folder `src/lessons/<group>/`, and a card in `src/data/groups.ts` (clear `comingSoon` if it was a placeholder).

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

| Command | Notes |
|---|---|
| `caption <text>` | Spoken while the step animates; keep it kid-simple |
| `TAG to x, y` | Move a player |
| `ball to x, y` / `ball with TAG` | Independent ball vs possession |
| `arrow from <TAG\|ball\|x, y> to <TAG\|ball\|x, y>` | Teaching/kick arrow |
| `draw …` | Yellow overlay (below) |
| `label TAG text` | Text on the token |
| `banner text` | Center overlay ("Throw-in") |
| `duration ms` | Move animation only |
| `hands TAG` | Goalie gloves |
| `no-hands` | Slash on the keeper this step |

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

Exactly: `prompt`, one `answer`, three `wrong`, `why`. Choices are shuffled at runtime. Two quiz beats for one play = **two files** that share the same setup/steps (see `ball-out/throw-in-blue-out.lesson` vs `ball-out/throw-in-blue-out-restart.lesson`).

## Audience

Kids ~8–10. You are blue. Captions and `why` should be short and concrete.

## After writing

1. `npm run type-check` — import of a bad file throws at load.
2. Run the app, open that group, confirm the play starts, answer, confirm leftover steps.

Templates: action play → `src/lessons/ball-out/throw-in-blue-out.lesson`. Field names → `src/lessons/names/name-sideline.lesson`. Goalie → `src/lessons/goalie-hands/hands-ok.lesson`.
