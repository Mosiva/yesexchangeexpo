# CLAUDE.md

## Project

Expo Router · React Native 0.81 · TypeScript strict · Expo SDK 54

## Run

```bash
npm run start      # Metro bundler
npm run android    # Android
npm run ios        # iOS
npm run lint       # ESLint
```

## Structure

- Routes: `src/app/` — groups `(auth)`, `(tabs)`, `(stacks)`
- Components: `src/components/ComponentName/index.tsx`
- API: `src/api.tsx` (base) + `src/services/` (endpoints)
- State: RTK Query → server, Zustand → UI, Context → Auth/Theme
- Types: `src/types/index.ts` (app) + `src/types/api.ts` (DTO)
- i18n: `src/local/translations/` → en / ru / kz

## Import aliases

`components`, `store`, `utils`, `api`, `providers`, `services`

## Core rules

- Colors only from `useTheme()` — no hardcoded values
- Styles via `StyleSheet.create` + `makeStyles(colors)`
- Strings via `useTranslation()` → add to en + ru + kz
- Header config in `_layout.tsx`, not in the screen
- Providers only in `src/app/_layout.tsx`
- Server state → RTK Query, not Zustand
- Unsure about a library's API — verify via context7, don't write from memory

---

## Two layers: process vs project knowledge

Work splits into two independent layers. They complement each other, they don't replace each other.

**Layer 1 — PROCESS (how to work).** Driven by the **superpowers** plugin.
Owns discipline: clarify → design → plan → code → test → self-review.
Auto-activates at the start of a session — no need to invoke it manually.

**Layer 2 — PROJECT KNOWLEDGE (what to build and by which rules).** Driven by personal Skills.
Owns the rules of this specific project: theme, i18n, RTK Query, folder structure.
superpowers does NOT know these — this knowledge lives only in the Skills and in this file.

---

## Installed plugins

**MCP servers (provide tools):**

- **context7** — up-to-date library docs. Use before writing code against an unfamiliar/updated API (RTK Query, Expo Router).
- **figma** — read designs by URL/node-id. Engine for the `/ui-from-figma` skill.
- **codegraph** — codebase graph: relationships between files, imports, functions. Use before a refactor/change — find where a component/DTO is used and what will break.

**Skills plugin (provides skills, not MCP tools):**

- **superpowers** — process engine. Enforces plan → tests → review. Auto-activates during feature development. Covers testing and quality verification entirely (no separate skill for tests).

---

## Personal Skills (project knowledge)

- `/ui-from-figma` — build UI from Figma following project rules (theme, i18n, structure). Uses the figma MCP.
- `/backend-integration` — connect API via RTK Query `injectEndpoints`. Uses context7 to verify signatures.
- `/research-docs` — research the project's architecture and documentation.

---

## Who does what (at a glance)

| Task                                                  | Owner                                 |
| ----------------------------------------------------- | ------------------------------------- |
| Plan before coding                                    | superpowers                           |
| Write tests, self-review                              | superpowers                           |
| Colors from `useTheme()`, styles via `makeStyles`     | `/ui-from-figma`                      |
| Strings in en/ru/kz via `useTranslation()`            | `/ui-from-figma`                      |
| Read designs from Figma                               | figma MCP (inside `/ui-from-figma`)   |
| Add an RTK Query endpoint                             | `/backend-integration`                |
| Verify a library's API                                | context7                              |
| Find where a component/DTO is used before changing it | codegraph (precise relationships)     |
| Understand architecture/project rules                 | `/research-docs` (overview + context) |

---

## Typical feature flow

1. Describe the task → **superpowers** starts with questions and a plan on its own
2. UI → `/ui-from-figma` (injects project rules into the code)
3. API → `/backend-integration` (RTK Query endpoint + types)
4. Tests and review → driven by **superpowers** at the verify stage

If the task is purely visual (a new screen from Figma) and superpowers pulls toward TDD —
build the UI first via `/ui-from-figma`; tests are added at the verify stage.
