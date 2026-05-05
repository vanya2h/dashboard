# Use shadcn/ui components

UI primitives come from **shadcn/ui** with the `base-nova` style — built on top of [Base UI](https://base-ui.com) (`@base-ui/react`). Components live in `packages/web/src/components/ui/` as kebab-case files (`button.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, etc.).

## Step 1 — check for an existing component

Look in [packages/web/src/components/ui/](packages/web/src/components/ui/) first. The components currently installed are:

```
badge, breadcrumb, button, dialog, dropdown-menu, input, progress, spinner, textarea
```

Run `pnpm dlx shadcn@latest info -c packages/web --json` to see the live list.

## Step 2 — adding a new component

Use the shadcn CLI scoped to the workspace:

```bash
pnpm dlx shadcn@latest add <component> -c packages/web
```

The CLI writes to `~/components/ui/<component>.tsx`, uses `~/lib/utils` for `cn`, and resolves icons from `lucide-react`. It also installs any required dependencies.

After adding, **read the generated file** and verify it follows the project's conventions before using it. Replace icon imports if the registry-default doesn't match the project (we use `lucide-react`).

## Step 3 — never write a wrapper around a shadcn component

Use shadcn components directly from feature files. Do not create thin wrappers in `src/components/ui/` — that's the shadcn folder, owned by the CLI. If you need to extend a component:

- For class overrides, pass `className` at the call site (it merges via `cn`).
- For variants the registry doesn't ship, edit the component's CVA `variants` block in place — that's how shadcn is meant to be customized.

## Polymorphism — use the `render` prop, not wrapping

Every shadcn component built on Base UI accepts a `render` prop. To turn a `Button` into a router link, pass a React Router `<Link>` to `render`:

```tsx
<Button variant="default" render={<Link to="/curriculum/new" />}>
  <Trans>New Program</Trans>
</Button>
```

Use the same pattern for `DropdownMenuTrigger`, `Tabs.Tab`, `DialogTrigger`, etc. when you need them rendered as a different element/component:

```tsx
<DropdownMenuTrigger render={<Button variant="ghost" />}>Open</DropdownMenuTrigger>
<DialogTrigger render={<Button variant="secondary" />}>Open dialog</DialogTrigger>
```

For dynamic render based on internal state, pass a function:

```tsx
<Tabs.Tab render={(p) => <Link to="/foo" {...p} />} />
```

**Never** wrap `<Link>` (or `<a>`) around a `<Button>` — that produces invalid HTML (`<a><button>`). **Never** use `onClick={() => navigate(...)}` on a button for navigation — use `render={<Link />}` instead.

## Component variants

Default shadcn variants the project uses today:

- **Button**: `variant` = `default | destructive | outline | secondary | ghost | link`; `size` = `default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg`
- **Badge**: `variant` = `default | secondary | destructive | outline | ghost | link`

Use `default` (not `primary`) for the main call-to-action; use `secondary` for non-primary actions; use `destructive` for irreversible actions.

## Available registry components

If a component isn't installed yet, browse the registry first:

```bash
pnpm dlx shadcn@latest search -c packages/web -q "<keyword>"
pnpm dlx shadcn@latest docs -c packages/web <component>
```

Categories: Button, Checkbox, Input, Select, Combobox, Switch, Toggle, OTP Field, Number Field, Field, Fieldset, Form, Slider, Progress, Avatar, Separator, Tooltip, Hover Card, Accordion, Collapsible, Tabs, Toolbar, Scroll Area, Dialog, Alert Dialog, Drawer, Popover, Toast, Dropdown Menu, Context Menu, Menubar, Navigation Menu, Breadcrumb, Pagination, Sidebar, Card, Table, Chart, Empty, Skeleton, Spinner, Alert.

## Animation states

Base UI exposes lifecycle data attributes on portaled/animated parts. Use these for enter/exit transitions instead of state libraries:

- `data-[starting-style]` — applied while the element is mounting
- `data-[ending-style]` — applied while the element is closing
- `data-open` / `data-closed` — open/closed state for overlays

shadcn components ship with these wired up. If you need to tweak the animation, edit the classes in the shadcn component file directly.
