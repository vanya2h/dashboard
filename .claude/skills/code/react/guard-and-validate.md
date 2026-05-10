# Guard-and-validate component split

When a component has nullable inputs (loader data fields, params, layout data) and uses them across multiple derived hooks, split into:

- **Outer component**: reads inputs, performs guards (`if (!x) return null`), and forwards the validated values as non-nullable props.
- **Inner component**: takes the validated props and assumes preconditions are met. All hooks/streams/effects live here.

## Pattern

```tsx
export default function StudyPage() {
  const loaderData = useLoaderData<typeof loader>();
  const layoutData = useRouteLoaderData<typeof layoutLoader>("routes/topic-layout");
  const { taskId, curriculumId } = useParams<{ taskId: string; curriculumId: string }>();

  if (!layoutData?.task || !taskId || !curriculumId) return null;

  return (
    <StudyView
      taskId={taskId}
      task={layoutData.task}
      curriculumName={layoutData.curriculumName ?? ""}
      initialMaterial={loaderData.name === "study" ? loaderData.material : null}
      handsOnRoute={getTopicLinks(curriculumId, taskId).handsOn}
    />
  );
}

type StudyViewProps = {
  taskId: string;          // not optional
  task: LayoutData["task"];
  curriculumName: string;
  initialMaterial: Material | null;
  handsOnRoute: string;
};

function StudyView({ taskId, task, ... }: StudyViewProps) {
  // all hooks, streams, effects assume task and taskId exist
}
```

## When to apply

- Same null check would otherwise repeat across 2+ `useMemo` / `useEffect` deps lists in the same component.
- Loader data shape varies by branch and the inner logic only cares about a normalized derived shape (compute the normalization in the outer, pass the result down).
- Routing/layout data needs to be combined into a single value (e.g. building a typed route URL) — do it once in the outer.

## Why

- Eliminates repeated `if (!x) return null` checks scattered through every derived hook.
- Inner component types describe the actual contract — no `task: Task | undefined` defensive typing.
- Hook order is predictable in the inner component — no early returns guarding hooks.
- The outer becomes a thin adapter; the inner is pure render logic over validated state.
