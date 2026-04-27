import { app } from "../../src/server/app";
import type { Route } from "./+types/api.chat";

export async function action({ request }: Route.ActionArgs) {
  return app.fetch(request);
}
