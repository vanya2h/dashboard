---
name: integrate-configs
description: Integrate @vanya2h/eslint-config, @vanya2h/prettier-config, and @vanya2h/typescript-config into the current project. Detects existing configs and asks before replacing them.
argument-hint: "[base|node|react|lib]"
allowed-tools: Read Glob Grep Bash
---

Integrate `@vanya2h/eslint-config`, `@vanya2h/prettier-config`, and `@vanya2h/typescript-config` into the current project.

## Step 1 — Determine the project type

If the user passed an argument, use it directly. Valid values: `base`, `node`, `react`, `lib`.

If no argument was given, ask the user:
> What type of project is this?
> 1. `base` — generic TypeScript package
> 2. `node` — Node.js app or server
> 3. `react` — React / browser app
> 4. `lib` — TypeScript library (builds to ESNext/Bundler)

Wait for the answer before continuing.

## Step 2 — Detect the package manager

Check for lock files in the project root:
- `pnpm-lock.yaml` → use `pnpm`
- `yarn.lock` → use `yarn`
- `package-lock.json` → use `npm`
- If none found, default to `npm`

## Step 3 — Detect existing configs and ask before replacing

Check for these files in the project root:

**ESLint:**
- `eslint.config.js`, `eslint.config.mjs`, `eslint.config.cjs`
- `.eslintrc`, `.eslintrc.js`, `.eslintrc.cjs`, `.eslintrc.json`, `.eslintrc.yaml`, `.eslintrc.yml`

**Prettier:**
- `prettier.config.js`, `prettier.config.mjs`, `prettier.config.cjs`
- `.prettierrc`, `.prettierrc.js`, `.prettierrc.cjs`, `.prettierrc.json`, `.prettierrc.yaml`, `.prettierrc.yml`
- `"prettier"` key in `package.json`

**TypeScript:**
- `tsconfig.json` (check if it already extends `@vanya2h/typescript-config`)

For any config file found that is NOT already using `@vanya2h/*`, ask the user:

> Found existing `<filename>`. Replace it with the shared config? (yes/no)

If the user says **no** for a config, skip that config entirely — do not install or write it.

## Step 4 — Install packages

Based on which configs the user approved, install only the needed packages:

| Config approved | Command |
|---|---|
| ESLint | `<pm> add -D @vanya2h/eslint-config eslint typescript` |
| Prettier | `<pm> add -D @vanya2h/prettier-config prettier` |
| TypeScript | `<pm> add -D @vanya2h/typescript-config typescript` |

Where `<pm>` is the package manager detected in Step 2. For `pnpm` use `pnpm add -D`, for `yarn` use `yarn add -D`, for `npm` use `npm install --save-dev`.

Run all approved installs. Show the commands before running them.

## Step 5 — Write config files

### ESLint (if approved)

Remove any old ESLint config files found in Step 3, then create `eslint.config.mjs`:

**base:**
```js
import { config } from "@vanya2h/eslint-config/base";

export default [...config];
```

**node:**
```js
import { config } from "@vanya2h/eslint-config/node";

export default [...config];
```

**react:**
```js
import { config } from "@vanya2h/eslint-config/react";

export default [...config];
```

### Prettier (if approved)

Remove any old Prettier config files found in Step 3.

Also remove the `"prettier"` key from `package.json` if it exists.

Then add to `package.json`:
```json
"prettier": "@vanya2h/prettier-config"
```

### TypeScript (if approved)

Check if `tsconfig.json` exists:
- If it exists and user approved replacement, update the `"extends"` field.
- If it does not exist, create it.

**base tsconfig:**
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@vanya2h/typescript-config/base"
}
```

**node tsconfig:**
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@vanya2h/typescript-config/node",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**react tsconfig:**
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@vanya2h/typescript-config/react",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**lib tsconfig:**
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@vanya2h/typescript-config/lib",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

When updating an existing `tsconfig.json`, preserve all other fields — only add/replace `"extends"`. Do not clobber `compilerOptions` or `include` that the user already has.

## Step 6 — Add lint scripts (optional)

Check whether `package.json` already has a `"lint"` script. If it does not, offer to add:
```json
"lint": "eslint ./",
"lint:fix": "eslint ./ --fix"
```

Ask: "Add lint scripts to package.json? (yes/no)"

## Step 7 — Summary

Print a short summary of what was installed and what files were created or skipped.
