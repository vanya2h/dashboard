# Use typed routes from `src/lib/routes.ts`

All in-app navigation must use the typed helpers in `src/lib/routes.ts` (`getHomeRoute`, `getProfileRoute`, `getAuthLinks`, `getCurriculumLinks`, `getTopicLinks`). Never hardcode paths or use relative path navigation.

## Wrong

```tsx
void navigate("../hands-on", { relative: "path" });
<Link to={`/topic/${cId}/${tId}/study`} />
return redirect(`/curriculum/${id}`);
```

## Right

```tsx
void navigate(getTopicLinks(curriculumId, taskId).handsOn);
<Link to={getTopicLinks(curriculumId, taskId).study} />
return redirect(getCurriculumLinks().byId(id));
```

## Rules

- Resolve the route URL where the params are available (often the outer `Page` component) and pass the resolved string down as a prop. The inner component shouldn't need to know about route topology.
- Add new endpoints by extending the relevant `get*Links` function in `src/lib/routes.ts`, not by hardcoding strings.
- Loaders, actions, and components all use the same helpers — there's a single source of truth for URL structure.
