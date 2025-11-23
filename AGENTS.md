# Repository Guidelines

## Project Structure & Module Organization
`src/` houses runtime code: `game/` for AD&D rules and GameEngine, `map/` for dungeon generation, `render/` for canvas + UI, `input/` for keyboard handling, `ai/` for NPC, DM, and scene generation flows, and `server/` for the Express proxy. Client entry is `src/main.ts`; Vite config sits in `vite.config.ts`. Reference docs in `docs/` (API, SECURITY, NPC_AGENT_SYSTEM) before touching AI workflows. Static assets stay under `public/`; build output lands in `dist/`.

## Build, Test, and Development Commands
- `npm install` once per clone to pull Vite, TypeScript, and LangChain deps.
- `npm run dev` launches the Vite client on :5173 (hot reload).
- `npm run server` runs the tsx-powered Express bridge at :3000; keep it in a second terminal when exercising AI calls.
- `npm run build` performs `tsc` type-checking then generates production assets via `vite build`.
- `npm run preview` serves the built bundle for release verification.

## Coding Style & Naming Conventions
Write modern TypeScript modules with ES imports/exports and keep 2-space indentation that the repo already uses. Prefer PascalCase for classes/types (`GameEngine`, `NpcManager`), camelCase for variables/functions, and kebab-case filenames matching their exported concept (`npc-agent.ts`). Keep side-effectful utilities pure and documented with concise block comments. Run `tsc` (via `npm run build`) before pushing to catch type regressions.

## Testing Guidelines
There is no automated harness yet; validate changes manually by running both `npm run dev` and `npm run server`, stepping through interactions that touch your code (combat, map gen, AI prompts, etc.). When adding tests, colocate `*.spec.ts` files beside the implementation so they can later be discovered by a Vitest or Jest runner, and favor seedable fixtures (see `docs/DEVELOPMENT.md` combat examples). Document manual test matrices in your PR description until a suite exists.

## Commit & Pull Request Guidelines
Follow the existing short imperative subject style (`Update documentation for LangChain NPC system`, `Security improvements: env variables`). Group related work per commit, reference issue IDs when applicable, and avoid bundling unrelated refactors with gameplay or AI tuning. PRs should summarize intent, outline validation steps or manual test notes, link any relevant design docs, and include screenshots/terminal captures when the UI or DM output changes.

## Security & Configuration Tips
Copy `.env.example` to `.env`, populate just the keys you need (`VITE_IMAGE_*`, Anthropic tokens), and never commit secrets. Review `docs/SECURITY.md` before touching authentication or API-proxy code, and prefer the server-side proxy in `src/server/index.ts` for outbound AI requests to keep API keys off the client.
