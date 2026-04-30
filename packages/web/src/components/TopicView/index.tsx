import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CURRICULUMS } from "../../data/curriculum";
import { useProgress } from "../../hooks/useProgress";
import { apiClient } from "../../lib/apiClient";
import { useClaude } from "../../lib/claude";
import { AssessmentSection, GapsReviewSection } from "./AssessmentSection";
import { ChoiceSection } from "./ChoiceSection";
import { CompleteSection } from "./CompleteSection";
import { ErrorSection } from "./ErrorSection";
import { HandsOnSection } from "./HandsOnSection";
import { LoadingSection } from "./LoadingSection";
import {
  ASSESSMENT_EVAL_SYSTEM,
  ASSESSMENT_SYSTEM,
  HANDS_ON_EVAL_SYSTEM,
  PART_SYSTEM,
  PLAN_SYSTEM,
  WRITEUP_SYSTEM,
} from "./prompts";
import { StudySection } from "./StudySection";
import type { Material, PersistedPhase, SessionPhase } from "./types";
import { Spinner } from "./ui";
import { extractStudy, parseJSON, parsePart, parsePlan } from "./utils";
import { WriteUpSection } from "./WriteUpSection";

const TOKENS_PLAN = 600;
const TOKENS_PART = 3000;
const TOKENS_ASSESSMENT = 300;
const TOKENS_ASSESSMENT_EVAL = 300;
const TOKENS_HANDS_ON_EVAL = 500;
const TOKENS_WRITEUP = 250;

function restorePhase(p: PersistedPhase): SessionPhase {
  if (p.name === "study") return { ...p, stream: "" };
  if (p.name === "hands-on") return { ...p, answers: {}, feedbackStreaming: false };
  if (p.name === "write-up") return { ...p, text: "", feedbackStreaming: false };
  if (p.name === "gaps-review") return p;
  return { name: "choice" };
}

export function TopicView() {
  // ── Hooks ────────────────────────────────────────────────────────────────
  const { curriculumId, taskId } = useParams<{ curriculumId: string; taskId: string }>();
  const navigate = useNavigate();
  const { completedTaskIds, toggleTask } = useProgress();
  const { streamAI, askAI } = useClaude();
  const [phase, setPhase] = useState<SessionPhase>({ name: "init" });
  const abortRef = useRef<AbortController | null>(null);
  const sessionLoadedRef = useRef(false);

  // ── Computed ─────────────────────────────────────────────────────────────
  const { task, curriculum } = (() => {
    for (const c of CURRICULUMS) {
      for (const p of c.phases) {
        for (const t of p.tasks) {
          if (t.id === taskId) return { task: t, curriculum: c };
        }
      }
    }
    return { task: null, curriculum: null };
  })();

  const isCompleted = task ? !!completedTaskIds[task.id] : false;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const goBack = () => navigate(`/curriculum/${curriculumId}`);

  function startOver() {
    abortRef.current?.abort();
    if (taskId) void apiClient.api["topic-sessions"][":taskId"].$delete({ param: { taskId } });
    setPhase({ name: "choice" });
  }

  function newAbort() {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    return ctrl;
  }

  // ── Core async functions — defined before useEffects to satisfy lint ──────

  async function loadPart(partIdx: number, material: Material) {
    if (!task || !curriculum) return;
    const ctrl = newAbort();
    const partPlan = material.plan.partPlans[partIdx];
    if (!partPlan) return;

    const otherParts = material.plan.partPlans.map((p, i) => `${i + 1}. ${p.title}: ${p.description}`).join("\n");

    const userMsg = [
      `Topic: "${task.title}"`,
      `Curriculum: ${curriculum.name}`,
      material.assessmentContext ? `Assessment context: ${material.assessmentContext}` : null,
      ``,
      `Generate part ${partIdx + 1} of ${material.plan.partPlans.length}: "${partPlan.title}"`,
      `Scope: ${partPlan.description}`,
      ``,
      `Full session outline:`,
      otherParts,
    ]
      .filter((l) => l !== null)
      .join("\n");

    try {
      const text = await streamAI(
        PART_SYSTEM,
        userMsg,
        (acc) => {
          if (!ctrl.signal.aborted) {
            setPhase((prev) => (prev.name === "study" ? { ...prev, stream: extractStudy(acc) } : prev));
          }
        },
        TOKENS_PART,
        ctrl.signal,
      );
      if (ctrl.signal.aborted) return;

      const studyPart = parsePart(text);
      const updatedParts = material.parts.map((p, i) => (i === partIdx ? studyPart : p));
      const updatedMaterial = { ...material, parts: updatedParts };

      setPhase((prev) => (prev.name === "study" ? { ...prev, material: updatedMaterial, stream: "" } : prev));
    } catch (err) {
      if (!ctrl.signal.aborted) setPhase({ name: "error", message: String(err) });
    }
  }

  async function loadPlan(assessmentContext?: string) {
    if (!task || !curriculum) return;
    const ctrl = newAbort();
    setPhase({ name: "loading", stream: "" });

    const userMsg = assessmentContext
      ? `Plan a study session for: "${task.title}"\nCurriculum: ${curriculum.name}\n\nAssessment context: ${assessmentContext}`
      : `Plan a study session for: "${task.title}"\nCurriculum: ${curriculum.name}`;

    try {
      const text = await streamAI(
        PLAN_SYSTEM,
        userMsg,
        (acc) => {
          if (!ctrl.signal.aborted) setPhase({ name: "loading", stream: acc });
        },
        TOKENS_PLAN,
        ctrl.signal,
      );
      if (ctrl.signal.aborted) return;

      const plan = parsePlan(text);
      if (plan.partPlans.length === 0) throw new Error("AI returned no study parts. Please try again.");

      const material: Material = {
        plan,
        parts: Array<null>(plan.partPlans.length).fill(null),
        assessmentContext,
      };

      setPhase({ name: "study", material, partIdx: 0, stream: "" });
      void loadPart(0, material);
    } catch (err) {
      if (!ctrl.signal.aborted) setPhase({ name: "error", message: String(err) });
    }
  }

  async function startAssessment() {
    if (!task || !curriculum) return;
    const ctrl = newAbort();
    setPhase({ name: "assessing", status: "loading", questions: [], answers: {}, evalStream: "" });
    try {
      const text = await askAI(
        ASSESSMENT_SYSTEM,
        `Topic: "${task.title}"\nCurriculum: ${curriculum.name}`,
        TOKENS_ASSESSMENT,
        ctrl.signal,
      );
      if (ctrl.signal.aborted) return;
      const { questions } = parseJSON<{ questions: string[] }>(text);
      setPhase({ name: "assessing", status: "answering", questions, answers: {}, evalStream: "" });
    } catch (err) {
      if (!ctrl.signal.aborted) setPhase({ name: "error", message: String(err) });
    }
  }

  async function submitAssessment(questions: string[], answers: Record<number, string>) {
    if (!task) return;
    const ctrl = newAbort();
    setPhase({ name: "assessing", status: "evaluating", questions, answers, evalStream: "" });

    const qa = questions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] ?? "(no answer)"}`).join("\n\n");

    try {
      const evalText = await streamAI(
        ASSESSMENT_EVAL_SYSTEM,
        `Topic: "${task.title}"\n\nAssessment:\n${qa}`,
        (acc) => {
          if (!ctrl.signal.aborted)
            setPhase({ name: "assessing", status: "evaluating", questions, answers, evalStream: acc });
        },
        TOKENS_ASSESSMENT_EVAL,
        ctrl.signal,
      );
      if (ctrl.signal.aborted) return;
      const { summary, gaps } = parseJSON<{ summary: string; gaps: string[] }>(evalText);
      const context =
        gaps.length > 0
          ? `Learner level: ${summary}. Key gaps to focus on: ${gaps.join(", ")}.`
          : `Learner level: ${summary}. Knowledge is solid — go deep and cover advanced nuances.`;
      setPhase({ name: "gaps-review", summary, gaps, context });
    } catch (err) {
      if (!ctrl.signal.aborted) setPhase({ name: "error", message: String(err) });
    }
  }

  async function submitHandsOn(partIdx: number, material: Material, answers: Record<number, string>) {
    const ctrl = newAbort();
    const part = material.parts[partIdx];
    if (!part) return;
    const qa = part.handsOn
      .map((t, i) => `Task ${i + 1}: ${t.task}\nAnswer ${i + 1}: ${answers[i] ?? "(no answer)"}`)
      .join("\n\n");
    setPhase((prev) => (prev.name === "hands-on" ? { ...prev, feedback: "", feedbackStreaming: true } : prev));
    try {
      await streamAI(
        HANDS_ON_EVAL_SYSTEM,
        qa,
        (acc) => {
          if (!ctrl.signal.aborted) {
            setPhase((prev) => (prev.name === "hands-on" ? { ...prev, feedback: acc } : prev));
          }
        },
        TOKENS_HANDS_ON_EVAL,
        ctrl.signal,
      );
      if (!ctrl.signal.aborted)
        setPhase((prev) => (prev.name === "hands-on" ? { ...prev, feedbackStreaming: false } : prev));
    } catch (err) {
      if (!ctrl.signal.aborted) setPhase({ name: "error", message: String(err) });
    }
  }

  async function submitWriteUp(partIdx: number, material: Material, text: string) {
    const ctrl = newAbort();
    const part = material.parts[partIdx];
    if (!part) return;
    setPhase((prev) => (prev.name === "write-up" ? { ...prev, feedback: "", feedbackStreaming: true } : prev));
    try {
      await streamAI(
        WRITEUP_SYSTEM,
        `Topic: "${part.title}"\nLearner's reflection: "${text}"`,
        (acc) => {
          if (!ctrl.signal.aborted) {
            setPhase((prev) => (prev.name === "write-up" ? { ...prev, feedback: acc } : prev));
          }
        },
        TOKENS_WRITEUP,
        ctrl.signal,
      );
      if (!ctrl.signal.aborted) {
        setPhase((prev) => (prev.name === "write-up" ? { ...prev, feedbackStreaming: false } : prev));
      }
    } catch (err) {
      if (!ctrl.signal.aborted) setPhase({ name: "error", message: String(err) });
    }
  }

  function handleNextPart(material: Material, partIdx: number) {
    const nextIdx = partIdx + 1;
    if (material.parts[nextIdx]) {
      setPhase({ name: "study", material, partIdx: nextIdx, stream: "" });
    } else {
      setPhase({ name: "study", material, partIdx: nextIdx, stream: "" });
      void loadPart(nextIdx, material);
    }
  }

  function handleGoToPart(material: Material, idx: number) {
    if (!material.parts[idx]) return;
    setPhase({ name: "study", material, partIdx: idx, stream: "" });
  }

  // ── Effects ───────────────────────────────────────────────────────────────

  // Load persisted session on mount; resume generation if it was interrupted
  useEffect(() => {
    if (!taskId) return;
    let cancelled = false;
    apiClient.api["topic-sessions"][":taskId"]
      .$get({ param: { taskId } })
      .then((r) => r.json())
      .then(({ phaseData }) => {
        if (!cancelled) {
          if (phaseData) {
            const p = phaseData as unknown as PersistedPhase;
            const restored = restorePhase(p);
            setPhase(restored);
            sessionLoadedRef.current = true;
            if (restored.name === "study" && !restored.material.parts[restored.partIdx]) {
              void loadPart(restored.partIdx, restored.material);
            }
          } else {
            setPhase({ name: "choice" });
            sessionLoadedRef.current = true;
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPhase({ name: "choice" });
          sessionLoadedRef.current = true;
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save on stable phase changes
  useEffect(() => {
    if (!sessionLoadedRef.current || !taskId) return;

    if (phase.name === "study") {
      void apiClient.api["topic-sessions"][":taskId"].$put({
        param: { taskId },
        json: { phaseData: { name: "study", material: phase.material, partIdx: phase.partIdx } },
      });
    } else if (phase.name === "hands-on" && !phase.feedbackStreaming) {
      void apiClient.api["topic-sessions"][":taskId"].$put({
        param: { taskId },
        json: {
          phaseData: { name: "hands-on", material: phase.material, partIdx: phase.partIdx, feedback: phase.feedback },
        },
      });
    } else if (phase.name === "write-up" && !phase.feedbackStreaming) {
      void apiClient.api["topic-sessions"][":taskId"].$put({
        param: { taskId },
        json: {
          phaseData: { name: "write-up", material: phase.material, partIdx: phase.partIdx, feedback: phase.feedback },
        },
      });
    } else if (phase.name === "gaps-review") {
      void apiClient.api["topic-sessions"][":taskId"].$put({
        param: { taskId },
        json: { phaseData: { name: "gaps-review", summary: phase.summary, gaps: phase.gaps, context: phase.context } },
      });
    } else if (phase.name === "complete") {
      void apiClient.api["topic-sessions"][":taskId"].$delete({ param: { taskId } });
    }
  }, [phase, taskId]);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (!task || !curriculum) goBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Guard ─────────────────────────────────────────────────────────────────

  if (!task || !curriculum) return null;

  // ── Render ────────────────────────────────────────────────────────────────

  const inSession = phase.name === "study" || phase.name === "hands-on" || phase.name === "write-up";

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <header className="flex items-start gap-4 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={goBack}
          className="mt-0.5 shrink-0 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          ← Back
        </button>
        <div className="min-w-0">
          <div className="text-xs text-neutral-400 dark:text-neutral-500 mb-0.5">{curriculum.name}</div>
          <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">{task.title}</h1>
        </div>
        <div className="ml-auto flex items-center gap-3 shrink-0">
          {inSession && (
            <button
              onClick={startOver}
              className="text-xs text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
            >
              Start over
            </button>
          )}
          {isCompleted && <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Completed</span>}
        </div>
      </header>

      {phase.name === "init" && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner />
        </div>
      )}
      {phase.name === "choice" && (
        <ChoiceSection onScratch={() => void loadPlan()} onAssess={() => void startAssessment()} />
      )}
      {phase.name === "assessing" && (
        <AssessmentSection
          phase={phase}
          onAnswerChange={(idx, text) =>
            setPhase((prev) =>
              prev.name === "assessing" ? { ...prev, answers: { ...prev.answers, [idx]: text } } : prev,
            )
          }
          onSubmit={() => {
            if (phase.name === "assessing") void submitAssessment(phase.questions, phase.answers);
          }}
        />
      )}
      {phase.name === "gaps-review" && (
        <GapsReviewSection phase={phase} onContinue={() => void loadPlan(phase.context)} />
      )}
      {phase.name === "loading" && <LoadingSection />}
      {phase.name === "study" && (
        <StudySection
          phase={phase}
          onMoveToHandsOn={() =>
            setPhase({
              name: "hands-on",
              material: phase.material,
              partIdx: phase.partIdx,
              answers: {},
              feedback: "",
              feedbackStreaming: false,
            })
          }
          onNextPart={() => handleNextPart(phase.material, phase.partIdx)}
          onGoToPart={(idx) => handleGoToPart(phase.material, idx)}
        />
      )}
      {phase.name === "hands-on" && (
        <HandsOnSection
          phase={phase}
          onAnswerChange={(idx, text) =>
            setPhase((prev) =>
              prev.name === "hands-on" ? { ...prev, answers: { ...prev.answers, [idx]: text } } : prev,
            )
          }
          onSubmit={() => void submitHandsOn(phase.partIdx, phase.material, phase.answers)}
          onMoveToWriteUp={() =>
            setPhase({
              name: "write-up",
              material: phase.material,
              partIdx: phase.partIdx,
              text: "",
              feedback: "",
              feedbackStreaming: false,
            })
          }
          onGoToPart={(idx) => handleGoToPart(phase.material, idx)}
        />
      )}
      {phase.name === "write-up" && (
        <WriteUpSection
          phase={phase}
          onUpdateText={(text) => setPhase((prev) => (prev.name === "write-up" ? { ...prev, text } : prev))}
          onSubmit={() => void submitWriteUp(phase.partIdx, phase.material, phase.text)}
          onComplete={() => {
            if (task && !isCompleted) void toggleTask(task.id);
            setPhase({ name: "complete" });
          }}
          onGoToPart={(idx) => handleGoToPart(phase.material, idx)}
        />
      )}
      {phase.name === "complete" && <CompleteSection taskTitle={task.title} onBack={goBack} onStartOver={startOver} />}
      {phase.name === "error" && <ErrorSection message={phase.message} onRetry={() => setPhase({ name: "choice" })} />}
    </div>
  );
}
