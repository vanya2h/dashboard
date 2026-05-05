import type { CurriculumDef } from "../data/curriculum";
import { PhaseCard } from "./PhaseCard";

type Props = { curriculum: CurriculumDef };

export function Curriculum({ curriculum }: Props) {
  return (
    <section>
      {curriculum.phases.map((phase, index) => (
        <PhaseCard key={phase.id} phase={phase} curriculumId={curriculum.id} index={index} />
      ))}
    </section>
  );
}
