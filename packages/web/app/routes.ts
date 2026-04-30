import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("sign-in", "./routes/sign-in.tsx"),
  route("sign-up", "./routes/sign-up.tsx"),
  route("api/*", "./routes/api.ts"),
  layout("./routes/app-layout.tsx", [
    index("./routes/home.tsx"),
    route("curriculum/:curriculumId", "./routes/curriculum.$curriculumId.tsx"),
    route("topic/:curriculumId/:taskId", "./routes/topic.$curriculumId.$taskId.tsx"),
  ]),
] satisfies RouteConfig;
