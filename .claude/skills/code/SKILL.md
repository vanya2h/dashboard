---
name: code
description: >
  Project-specific coding standards for the dashboard monorepo. Invoke before making any code changes.
  Loads only the rule files relevant to what is being changed: CSS/Tailwind, TypeScript, React components,
  or React Router routes.
allowed-tools: Read Bash Edit Write
---

# Code Standards

Before writing any code, read the rule files that apply to this task. Each file is a standalone reference — read it in full before touching the relevant code.

## Rule files

| Domain | File | When to read |
|---|---|---|
| CSS / Tailwind | `css.md` | Any `.css` file or Tailwind class changes |
| TypeScript | `typescript.md` | Any `.ts` or `.tsx` file |
| React components | `react.md` | Any component file under `src/components/` or `app/routes/` |
| React Router | `react-router.md` | Any file in `app/routes/` or `app/routes.ts` |

Read each applicable file now with the Read tool before proceeding.

Rule files live next to this file:
- `.claude/skills/code/css.md`
- `.claude/skills/code/typescript.md`
- `.claude/skills/code/react.md`
- `.claude/skills/code/react-router.md`

## Definition of Done

Every task is complete only after both pass with no errors:

```bash
pnpm --filter web run typecheck
pnpm run lint:fix
```

Run these at the end and fix any errors before reporting done.
