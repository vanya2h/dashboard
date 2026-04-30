import { Dashboard } from "../../src/components/Dashboard";
import { requireSession } from "../../src/server/session";
import type { Route } from "./+types/home";

export async function loader({ request }: Route.LoaderArgs) {
  await requireSession(request);
  return {};
}

export default function HomePage() {
  return <Dashboard />;
}
