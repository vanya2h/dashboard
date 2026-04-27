import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("curriculum/:curriculumId", "./routes/curriculum.$curriculumId.tsx"),
  route("topic/:curriculumId/:taskId", "./routes/topic.$curriculumId.$taskId.tsx"),
  route("api/chat", "./routes/api.chat.ts"),
] satisfies RouteConfig;
