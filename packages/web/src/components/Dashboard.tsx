import { Badge } from "@cloudflare/kumo/components/badge";
import { LayerCard } from "@cloudflare/kumo/components/layer-card";
import { Meter } from "@cloudflare/kumo/components/meter";
import { Text } from "@cloudflare/kumo/components/text";
import { Trans, useLingui } from "@lingui/react/macro";
import clsx from "clsx";
import { useMemo } from "react";
import { Link } from "react-router";
import type { CurriculumDef, Skill } from "../data/types";
import { useAllCurriculums } from "../hooks/useAllCurriculums";
import { useProgress } from "../hooks/useProgress";
import { computeUnlockedSkills } from "../lib/skills";

function calcCurriculumProgress(curriculum: CurriculumDef, completedTaskIds: Record<string, string>) {
  let totalWeight = 0;
  let doneWeight = 0;
  for (const phase of curriculum.phases) {
    totalWeight += phase.tasks.reduce((s, t) => s + (t.estMinutes ?? 60), 0);
    doneWeight += phase.tasks.filter((t) => completedTaskIds[t.id]).reduce((s, t) => s + (t.estMinutes ?? 60), 0);
  }
  return totalWeight === 0 ? 0 : Math.round((doneWeight / totalWeight) * 100);
}

function SkillBadge({ skill, recentlyUnlocked }: { skill: Skill; recentlyUnlocked: boolean }) {
  return (
    <div
      className={clsx(
        "rounded-lg border p-3 flex flex-col gap-1 transition-colors",
        recentlyUnlocked
          ? "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950/60 ring-2 ring-green-400 dark:ring-green-600 ring-offset-1 ring-offset-background"
          : "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-bold text-green-600 dark:text-green-400">✓</span>
        <span className="text-sm font-semibold leading-snug text-foreground">{skill.name}</span>
        {recentlyUnlocked && (
          <Badge variant="success" className="ml-auto">
            <Trans>New</Trans>
          </Badge>
        )}
      </div>
      <p className="text-xs leading-snug text-muted-foreground">{skill.description}</p>
    </div>
  );
}

function SkillsSection({ completedTaskIds }: { completedTaskIds: Record<string, string> }) {
  const allCurriculums = useAllCurriculums();
  const unlockedSkills = useMemo(
    () => computeUnlockedSkills(completedTaskIds, allCurriculums),
    [completedTaskIds, allCurriculums],
  );
  const { unlockedIds, recentIds } = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return {
      unlockedIds: new Set(unlockedSkills.map((u) => u.skill.id)),
      recentIds: new Set(unlockedSkills.filter((u) => u.unlockedAt >= sevenDaysAgo).map((u) => u.skill.id)),
    };
  }, [unlockedSkills]);

  const curriculumsWithUnlockedSkills = allCurriculums
    .map((c) => ({ ...c, unlockedSkills: (c.skills ?? []).filter((s) => unlockedIds.has(s.id)) }))
    .filter((c) => c.unlockedSkills.length > 0);

  if (curriculumsWithUnlockedSkills.length === 0) return null;

  return (
    <section className="px-6 py-4 border-b border-border">
      <div className="mb-4">
        <Text variant="heading3" as="h2">
          <Trans>Skills</Trans>
        </Text>
      </div>
      <div className="flex flex-col gap-6">
        {curriculumsWithUnlockedSkills.map((curriculum) => (
          <div key={curriculum.id}>
            <h3 className="text-xs font-medium text-foreground/40 mb-2">{curriculum.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {curriculum.unlockedSkills.map((skill) => (
                <SkillBadge key={skill.id} skill={skill} recentlyUnlocked={recentIds.has(skill.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Dashboard() {
  const { t } = useLingui();
  const { completedTaskIds } = useProgress();
  const allCurriculums = useAllCurriculums();

  return (
    <main>
      <section className="px-6 py-4 border-b border-border">
        <div className="mb-3">
          <Text variant="heading3" as="h2">
            <Trans>Programs</Trans>
          </Text>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allCurriculums.map((curriculum) => {
            const pct = calcCurriculumProgress(curriculum, completedTaskIds);
            const { coverImage, complexity } = curriculum;
            return (
              <LayerCard key={curriculum.id} render={<Link to={`/curriculum/${curriculum.id}`} />}>
                <LayerCard.Secondary
                  className={clsx(
                    "text-foreground",
                    coverImage && "relative min-h-28 p-0 my-0 items-end overflow-hidden",
                  )}
                >
                  {coverImage ? (
                    <>
                      <img src={coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/70" />
                      {complexity && (
                        <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-black/50 text-white backdrop-blur-sm">
                          {complexity}
                        </span>
                      )}
                      <span className="relative z-10 p-3 text-white w-full text-base font-medium leading-snug">
                        {curriculum.name}
                      </span>
                    </>
                  ) : (
                    curriculum.name
                  )}
                </LayerCard.Secondary>
                <LayerCard.Primary className="h-full">
                  {curriculum.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{curriculum.description}</p>
                  )}
                  <Meter label={t`Progress`} value={pct} showValue />
                </LayerCard.Primary>
              </LayerCard>
            );
          })}
          <Link
            to="/curriculum/new"
            className="flex items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-foreground/30 transition-colors min-h-25 text-muted-foreground hover:text-foreground/60"
          >
            <span className="text-sm font-medium">
              <Trans>+ Create new program</Trans>
            </span>
          </Link>
        </div>
      </section>
      <SkillsSection completedTaskIds={completedTaskIds} />
    </main>
  );
}
