import { Breadcrumbs } from "@cloudflare/kumo/components/breadcrumbs";
import { Button } from "@cloudflare/kumo/components/button";
import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import { MoonIcon } from "@phosphor-icons/react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { useRootData } from "../../app/hooks/useRootData";
import { CURRICULUMS } from "../data/curriculum";
import { useProgress } from "../hooks/useProgress";
import { useTheme } from "../hooks/useTheme";
import { authClient } from "../lib/authClient";
import type { AuthUser } from "../server/auth";

function hashToHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffff;
  return h % 360;
}

function UserAvatar({ user }: { user: AuthUser }) {
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const hue = hashToHue(user.id);

  if (user.image) {
    return <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover" />;
  }

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${(hue + 60) % 360}, 65%, 40%))`,
      }}
    >
      {initials}
    </div>
  );
}

function calcCurriculumProgress(curriculumId: string, completedTaskIds: Record<string, string>) {
  const curriculum = CURRICULUMS.find((c) => c.id === curriculumId);
  if (!curriculum) return 0;
  let totalWeight = 0;
  let doneWeight = 0;
  for (const phase of curriculum.phases) {
    totalWeight += phase.tasks.reduce((s, t) => s + (t.estMinutes ?? 60), 0);
    doneWeight += phase.tasks.filter((t) => completedTaskIds[t.id]).reduce((s, t) => s + (t.estMinutes ?? 60), 0);
  }
  return totalWeight === 0 ? 0 : Math.round((doneWeight / totalWeight) * 100);
}

export function Header() {
  const user = (useRootData()?.user ?? null) as AuthUser | null;
  const { completedTaskIds } = useProgress();
  const { toggle } = useTheme();

  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ curriculumId?: string }>();

  const isDashboard = location.pathname === "/";
  const activeCurriculumId = params.curriculumId ?? null;
  const activeCurriculum = activeCurriculumId ? CURRICULUMS.find((c) => c.id === activeCurriculumId) : null;

  const pct = activeCurriculumId && !isDashboard ? calcCurriculumProgress(activeCurriculumId, completedTaskIds) : null;

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold tracking-tight">
          <Link to="/" className="text-neutral-900 dark:text-neutral-100 hover:opacity-75 transition-opacity">
            Learning Tracker
          </Link>
        </h1>
        {isDashboard ? null : (
          <Breadcrumbs size="sm">
            <Breadcrumbs.Separator />
            <Breadcrumbs.Current>{activeCurriculum?.name ?? ""}</Breadcrumbs.Current>
          </Breadcrumbs>
        )}
      </div>

      <div className="flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
        {pct !== null && (
          <span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{pct}%</span> complete
          </span>
        )}

        {user && (
          <DropdownMenu>
            <DropdownMenu.Trigger
              render={
                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600" />
              }
            >
              <UserAvatar user={user} />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Group>
                <DropdownMenu.Label>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{user.name}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
                </DropdownMenu.Label>
              </DropdownMenu.Group>
              <DropdownMenu.Separator />
              <DropdownMenu.Item onClick={() => authClient.signOut().then(() => navigate("/sign-in"))}>
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        )}
        <Button icon={MoonIcon} size="sm" onClick={toggle} aria-label="Toggle theme" />
      </div>
    </header>
  );
}
