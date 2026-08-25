# Lessons

Each `*.lesson` file is one lesson: setup, animated steps, then one or more questions.

Put files in a **course folder**. The folder is the course; the file name (without `.lesson`) is the lesson id.

```
src/lessons/ball-out/throw-in-blue-out.lesson
src/lessons/goalie-hands/throw-in-to-goalie.lesson
src/lessons/names/name-sideline.lesson
```

Cursor agents: follow `.cursor/skills/soccer-school-lessons/SKILL.md`.

## Add a lesson

1. Copy a similar file in the matching course folder.
2. Name the file after the lesson (`throw-in-to-goalie.lesson`). Set `title` and `intro`.
3. Each `question` needs a prompt, one answer, three wrongs, a `correct` line (short praise, spoken on a hit), and a `why` (the teaching, spoken on a miss). Ask two questions about the same moment by putting two `question` blocks back to back.
4. Course folders: `names`, `ball-out`, `goalie-hands`, or `fouls`.

Files are loaded automatically. A syntax error prevents the app from starting. Do not write `course` or `id` in the file.

## Quick syntax

```
title Short title
intro What to do before Watch.

setup
  lineup 7v7
  player B-RF at 56.7, 51.7
  ball with B-RF

step
  caption What is happening.
  ball to 71.4, 73.4
  arrow from B-RF to ball
  draw sideline bottom

question
  prompt Who gets the ball?
  answer Red
  wrong Blue
  wrong Nobody
  wrong Play on
  correct Red's ball.
  why One or two kid-friendly sentences.
```

Every `step` comes before the questions. The lesson ends on the last answer, so there is no step after a `question`.

Coords are metres on a 105 × 68 pitch (your goal at `x = 0`, top sideline at `y = 0`). Tags are `B-RF`, `R-G`, and so on.
