# Soccer School

A visual soccer-rules lesson and quiz for kids about 8–10. You are the **blue** team. Watch the play, then pick what happens next.

## What it teaches

1. Ball over the **sideline** → throw-in for the other team
2. Ball over the **goal line** (not a goal) → goal kick or corner, depending on who last touched it
3. After a **goal** → kick-off from the center by the team that got scored on
4. **Goalkeeper hands** → only in their own penalty area, and not from a teammate’s kick or throw-in. After a catch, they can throw or kick it out.
5. **Pitch names** → sideline, goal line, penalty area, goal area, halfway line, center circle, penalty spot

## Quizzes

- **What happens next?** — watch a play, then choose the restart
- **Name the pitch** — a part of the field glows; pick its name

## Run it

```sh
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## Build

```sh
npm run build
```

## Deploy to Cloudflare

Git-connected Workers (current Cloudflare default) runs `wrangler deploy` after your build.

1. Build command: `npm run build` (output: `dist`).
2. Config is in `wrangler.toml` (`[assets]` → `./dist`, SPA `not_found_handling`).
3. Push to the connected branch; Cloudflare builds and deploys automatically.
