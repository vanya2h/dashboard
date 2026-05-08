# Layout primitives — page composition

All page chrome (column shell, vertical rhythm, horizontal gutters, content width, sections) flows from a small set of primitives in `src/components/layout/`. Use them; do **not** hardcode `px-*` / `py-*` for column-edge or page-level chrome.

## The components

| Primitive | Renders | What it owns |
|---|---|---|
| `Container` | `<div>` | Outer column shell — `max-w-360 mx-auto border-x border-border min-h-screen flex flex-col`. Lives in `app-layout.tsx`. Pages don't render this. |
| `PageBody` | `<main>` | Page semantic root. `flex flex-col grow`. **One per route.** |
| `PageContent` | `<div>` (polymorphic via `as`) | Vertical rhythm. `flex flex-col grow py-6 sm:py-8`. |
| `Inset` | `<div>` (polymorphic via `as`) | Responsive horizontal gutters. `px-4 sm:px-6 lg:px-8`. |
| `ReadingColumn` | `<div>` | Narrow reading-width column. `max-w-3xl w-full mx-auto` + Inset baked in. |
| `Section` | `<section>` | Bordered slice — `border-b border-border last:border-b-0`. |
| `SectionHeader` | `<div>` (Inset) | Heading row inside a Section: `py-3 sm:py-4 border-b flex items-center justify-between gap-4`. |

## Canonical page composition

```tsx
<PageBody>
  <PageContent>
    <ReadingColumn>
      {/* page content */}
    </ReadingColumn>
  </PageContent>
</PageBody>
```

This is the default for any new page. Variations below.

## Variations

### Full-width sections (no narrow reading column)

```tsx
<PageBody>
  <Section>
    <SectionHeader>
      <h2 className="text-base font-semibold text-foreground">Title</h2>
    </SectionHeader>
    <div className="grid ...">
      {/* full-width grid cells */}
    </div>
  </Section>
</PageBody>
```

### Sticky bottom action bar

Action bar is a sibling of `PageContent` inside `PageBody`:

```tsx
<PageBody>
  <PageContent>
    <ReadingColumn>...</ReadingColumn>
  </PageContent>
  {!readOnly && <TopicActionBar>...</TopicActionBar>}
</PageBody>
```

### Page with cover / decorative background

Cover and `<GridBackground>` are absolute siblings inside `PageBody` (which gets `relative`):

```tsx
<PageBody className="relative">
  <div className="absolute inset-0">
    <ProgramCover ... />
  </div>
  <GridBackground />
  <PageContent>
    <ReadingColumn>...</ReadingColumn>
  </PageContent>
</PageBody>
```

### Wider content width (e.g. dashboard-style)

Override the column width on `PageContent` via className. Don't introduce new "wide" primitives.

```tsx
<PageBody className="relative">
  <PageContent className="relative max-w-6xl w-full mx-auto">
    <Inset>...</Inset>
  </PageContent>
</PageBody>
```

### Centered minimal-viewport (Done / Complete pages)

```tsx
<PageBody>
  <PageContent>
    <Inset className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      ...
    </Inset>
  </PageContent>
</PageBody>
```

## Rules

- **Never hardcode** `px-4 sm:px-6 lg:px-8` for column-edge gutters — wrap in `<Inset>` or use `<ReadingColumn>`.
- **Never hardcode** `py-6 sm:py-8` (or `py-8`) on a page wrapper — use `<PageContent>`.
- `Inset`, `PageContent`, and `PageBody` accept an `as` prop for semantic tags (`as="section"`, `as="header"`, etc.).
- When a `Section` has a heading row, use `<SectionHeader>` — don't duplicate `px-... py-4 border-b`.
- **Card-internal padding** (e.g. `Card.Entry`'s `px-6`, `p-3` inside a grid cell) is component-internal, not column-edge. Leave it inline. Don't wrap card internals in `<Inset>`.
- **Bordered grid cells** (`CELL_BORDERS` `nth-child` pattern) sit directly inside a `<Section>` — they share borders with the column's `border-x` and don't need `<Inset>`.

## Changing the spacing scale globally

Single source of truth for each axis:

- Horizontal gutters: `Inset.tsx` (and the same constants baked into `ReadingColumn.tsx`).
- Page vertical rhythm: `PageContent.tsx`.
- Section heading row: `SectionHeader.tsx`.

A site-wide tweak is a one-file change — don't grep-and-replace.
