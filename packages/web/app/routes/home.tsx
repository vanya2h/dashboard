import { Dashboard } from "../../src/components/Dashboard";
import type { Route } from "./+types/home";

export function meta(): Route.MetaDescriptors {
  return [
    { title: "Dashboard — Learning Tracker" },
    { name: "description", content: "Track your learning progress and manage your curriculum." },
  ];
}

export default function HomePage() {
  return <Dashboard />;
}
