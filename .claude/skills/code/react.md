# React Component Rules

## Use Kumo UI components

Before building any UI primitive, check if Kumo has it:

```bash
npx @cloudflare/kumo ls          # list all available components
npx @cloudflare/kumo doc <Name>  # props and examples for a specific component
```

Components available in `@cloudflare/kumo`: Badge, Button, LayerCard, Meter, Tabs, Dialog, Tooltip, Table, and many more.

Import from the sub-path, not the barrel:
```tsx
import { Meter } from "@cloudflare/kumo/components/meter";
import { LayerCard } from "@cloudflare/kumo/components/layer-card";
```

Use `Text` for all typographic elements. Note: `Text` does **not** accept `className` or `style` — wrap it in a `div`/`span` for spacing or layout classes:

```tsx
<div className="mb-4">
  <Text variant="heading3" as="h2">Section title</Text>
</div>
```

Use heading variants (`heading1`, `heading2`, `heading3`) for all headers — never `secondary` with a `size` prop. The `size` prop only applies to body/secondary/success/error variants.

Use `LayerCard` idiomatically with its sub-components:
```tsx
<LayerCard render={<Link to="/path" />}>
  <LayerCard.Secondary>Label above</LayerCard.Secondary>
  <LayerCard.Primary>
    <p className="text-sm">Body content</p>
  </LayerCard.Primary>
</LayerCard>
```

## No custom implementations of things Kumo provides

- Progress bar → `Meter`
- Loading state → `Loader`
- Notification → `Toasty`
- Status chip → `Badge`

## Theme colors in JSX

Never write neutral gray pairs inline. Follow `css.md` — use `text-foreground`, `text-muted-foreground`, etc.

## No inline styles for colors

Never use `style={{ color: '...' }}` or `style={{ background: '...' }}` for theme colors. Always use Tailwind utilities backed by CSS variables.

## Conditional class names — use clsx

Never use template-literal ternaries for conditional Tailwind classes. Always use `clsx`:

```tsx
// bad
className={`base-classes ${condition ? "a" : "b"}`}
className={`base-classes ${condition ? "" : "hidden"}`}

// good
className={clsx("base-classes", condition ? "a" : "b")}
className={clsx("base-classes", !condition && "hidden")}
```

Import: `import clsx from "clsx";`

## No comments that describe what the code does

Only add a comment if the *why* is non-obvious. Never describe what a function or component does — the name and types already say that.
