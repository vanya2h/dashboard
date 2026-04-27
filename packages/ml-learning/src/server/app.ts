import { Hono } from "hono";
import { chatRoute } from "./routes/chat";

const app = new Hono()
  .onError((err, c) => {
    console.error("[api] unhandled error:", err);
    return c.json({ error: err.message }, 500);
  })
  .route("/api", chatRoute);

export type AppType = typeof app;
export { app };
