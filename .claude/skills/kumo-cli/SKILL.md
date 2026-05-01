---
name: kumo-cli
description: >
  Guides users through discovering, exploring, and installing components and blocks from the Kumo UI library (@cloudflare/kumo) using the Kumo CLI. Use this skill whenever the user mentions Kumo UI, @cloudflare/kumo, needs help finding or using a Kumo component, wants to install a Kumo block, asks what Kumo components exist, wants to look up props/variants for a Kumo component, or is building UI with the Cloudflare design system. Trigger even if the user says "kumo" without explicitly asking for CLI help.
---

# Kumo CLI

Kumo is Cloudflare's React component library (`@cloudflare/kumo`). The CLI gives you terminal access to component docs and a blocks installer — no setup needed.

## Quick Reference

```bash
# No installation — run everything via npx
npx @cloudflare/kumo help          # show all commands

# Component registry
npx @cloudflare/kumo ls            # list all 42 components by category
npx @cloudflare/kumo doc <Name>    # detailed docs for one component (props, examples, tokens)
npx @cloudflare/kumo docs          # docs for every component at once

# Blocks (copy-paste full UI patterns)
npx @cloudflare/kumo init          # create kumo.json config in your project
npx @cloudflare/kumo blocks        # list available blocks
npx @cloudflare/kumo add <Block>   # install a block into your project
```

## Component Catalog (42 components, 8 categories)

**Action:** Button, ClipboardText

**Display:** Badge, Breadcrumbs, Code, Collapsible, Empty, LayerCard, Meter, Text

**Feedback:** Banner, Loader, Toasty

**Input:** Checkbox, Combobox, DateRangePicker, Field, Input, InputArea, InputGroup, Radio, Select, Switch

**Layout:** Grid, Surface

**Navigation:** CommandPalette, MenuBar, Pagination, Tabs

**Other:** Autocomplete, CloudflareLogo, DatePicker, Label, Link, SensitiveInput, Sidebar, Table, TableOfContents

**Overlay:** Dialog, DropdownMenu, Popover, Tooltip

## Available Blocks

Blocks are larger copy-paste patterns (full components, not primitives). After `npx @cloudflare/kumo init`:

- **PageHeader** — `npx @cloudflare/kumo add PageHeader`
- **ResourceList** — `npx @cloudflare/kumo add ResourceList`
- **DeleteResource** — `npx @cloudflare/kumo add DeleteResource`

## Import Pattern

All components come from one package:

```tsx
import { Button, Badge, Dialog } from "@cloudflare/kumo";
```

## What `doc` Returns

Running `npx @cloudflare/kumo doc Button` gives you:
- Description
- Import path
- Category
- All props with types, defaults, and per-variant descriptions
- Code examples
- Semantic design tokens used by that component

Example output for Button:
- **shape:** `"base" | "square" | "circle"` (default: base)
- **size:** `"xs" | "sm" | "base" | "lg"` (default: base)
- **variant:** `"primary" | "secondary" | "ghost" | "destructive" | "secondary-destructive" | "outline"` (default: secondary)
- **type:** `"submit" | "reset" | "button"`

## How to Help Users

**"What components are available?"**
→ Point to `npx @cloudflare/kumo ls` and share the catalog above for quick lookup.

**"How do I use [ComponentName]?"**
→ Tell them to run `npx @cloudflare/kumo doc ComponentName` and explain the key props. Use Playwright to browse `https://kumo-ui.com/components/<component-slug>` for live examples if they need more detail.

**"How do I add a block?"**
→ Walk them through: `init` first (creates `kumo.json`), then `add <BlockName>`.

**"What's the import for X?"**
→ All imports are `import { X } from "@cloudflare/kumo"`.

## Browsing Live Docs with Playwright

When the user needs richer information (live examples, visual reference, sub-component composition patterns), browse the docs:

- Component page: `https://kumo-ui.com/components/<slug>` (e.g. `/components/button`)
- Component slugs match lowercase names with hyphens: `CommandPalette` → `command-palette`, `DateRangePicker` → `date-range-picker`
- Registry JSON: `https://kumo-ui.com/api/component-registry`
- Blocks: `https://kumo-ui.com/blocks/<slug>`

Take a snapshot of the main content area and extract props, examples, and usage notes.

## Registry JSON API

For programmatic access or AI tooling:

```bash
curl https://kumo-ui.com/api/component-registry
```

Returns all 42 components with full props, variants, examples, and semantic tokens.
