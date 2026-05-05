# Conditional class names — use cn

Use the `cn` helper (`src/lib/utils.ts`) for any class name composition. It wraps `clsx` with `tailwind-merge`, so conflicting Tailwind utilities later in the list win — letting callers override defaults via `className` cleanly.

Never use template-literal ternaries for conditional Tailwind classes. Never import `clsx` directly in components — always go through `cn`.

```tsx
// bad
className={`base-classes ${condition ? "a" : "b"}`}
className={clsx("base-classes", condition ? "a" : "b")}

// good
className={cn("base-classes", condition ? "a" : "b")}
className={cn("base-classes", !condition && "hidden")}
className={cn("px-4 py-2", className)} // caller's `px-6` overrides default `px-4`
```

Import: `import { cn } from "~/lib/utils";`
