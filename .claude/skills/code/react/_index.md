# React Component Rules

For any layout, markup, or visual decision (which element to use, sizing, spacing, hierarchy, composition), read `DESIGN.md` at the repo root before coding — it is the authoritative reference for the project's visual language.

| # | Rule | Description | File |
|---|------|-------------|------|
| 1 | shadcn/ui components | Use shadcn components from `src/components/ui/` (kebab-case); add via `pnpm dlx shadcn@latest add ... -c packages/web` | `base-ui-components.md` |
| 2 | No inline color styles | Never use `style={{ color }}` — use Tailwind utilities with CSS variables | `no-inline-color-styles.md` |
| 3 | Conditional classes (cn) | Use `cn()` from `~/lib/utils` (clsx + tailwind-merge); never import `clsx` directly | `cn.md` |
| 4 | Prop forwarding | Exported `<ComponentName>Props` type that extends the root's props; spread `...restProps` to root | `prop-forwarding.md` |
| 5 | Component ordering | Main exported component first, helpers below in order of first use | `component-ordering.md` |
| 6 | No describing comments | Only comment the *why*, never describe what code does | `no-describing-comments.md` |
| 7 | Layout primitives | Compose pages with `PageBody` / `PageContent` / `ReadingColumn` / `Section` / `Inset`; never hardcode `px-*` or `py-*` for column-edge or page-level chrome | `layout-primitives.md` |
