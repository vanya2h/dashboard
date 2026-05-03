import { Dashboard } from "../../src/components/Dashboard";
import { requireSession } from "../../src/server/session";
import type { Route } from "./+types/home";

export function meta(): Route.MetaDescriptors {
  return [
    { title: "Dashboard — Learning Tracker" },
    { name: "description", content: "Track your learning progress and manage your curriculum." },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireSession(request);
  return {};
}

export default function HomePage() {
  return <Dashboard />;
}
