# Lessons

Each `*.lesson` file is one play: setup, animated steps, one or more questions, optional steps after the last answer.

Put files in a **group folder**. The folder is the group; the file name (without `.lesson`) is the lesson id.

```
src/lessons/ball-out/throw-in-blue-out.lesson
src/lessons/goalie-hands/throw-in-to-goalie.lesson
src/lessons/names/name-sideline.lesson
```

Cursor agents: follow `.cursor/skills/soccer-school-lessons/SKILL.md`.

## Add a lesson

1. Copy a similar file in the matching group folder.
2. Name the file after the lesson (`throw-in-to-goalie.lesson`). Set `title` and `intro`.
3. Each `question` needs a prompt, one answer, three wrongs, a `correct` line (short praise, spoken on a hit), and a `why` (the teaching, spoken on a miss). Ask two questions about the same moment by putting two `question` blocks back to back.
4. Group folders: `names`, `ball-out`, `goalie-hands`, or `fouls`.

Files are loaded automatically. A syntax error prevents the app from starting. Do not write `group` or `id` in the file.

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

step
  caption What happens next.
```

Coords are metres on a 105 × 68 pitch (your goal at `x = 0`, top sideline at `y = 0`). Tags are `B-RF`, `R-G`, and so on.
