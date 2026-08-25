# Soccer School

A visual soccer-rules quiz for kids about 8–10, installable as a PWA. You are the **blue** team. Watch the play, then pick what happens next.

Work is organised into **courses**. A course is a folder of **lessons** (`src/lessons/<course>/<lesson>.lesson`), and you get one score per course.

## What it teaches

1. Ball over the **sideline** → throw-in for the other team
2. Ball over the **goal line** (not a goal) → goal kick or corner, depending on who last touched it
3. After a **goal** → kick-off from the center by the team that got scored on
4. **Goalkeeper hands** → only in their own penalty area, and not from a teammate’s kick or throw-in. After a catch, they can throw or kick it out.
5. **Pitch names** → sideline, goal line, penalty area, goal area, halfway line, center circle, penalty spot

## Courses

- **Ball out**, **Goalie hands** — watch a play, then choose the restart
- **Name the field** — a part of the field glows; pick its name

Answers can be tapped while the clip is still playing; doing so stops the clip and marks the answer.

## Run it

This project uses [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## Build

```sh
pnpm build
```

## Install it (PWA)

The build ships a web manifest and a service worker (`vite-plugin-pwa`), so the app installs to a tablet home screen and runs offline. Installed, it opens fullscreen in landscape, which keeps the browser bar and the system bar off the play screen.

Icons are generated from `public/logo.svg`:

```sh
pnpm generate-pwa-assets
```

## Deploy to Cloudflare

Git-connected Workers (current Cloudflare default) runs `wrangler deploy` after your build.

1. Build command: `pnpm build` (output: `dist`). Cloudflare picks pnpm up from `pnpm-lock.yaml` and the `packageManager` field.
2. Config is in `wrangler.toml` (`[assets]` → `./dist`, SPA `not_found_handling`).
3. Push to the connected branch; Cloudflare builds and deploys automatically.
