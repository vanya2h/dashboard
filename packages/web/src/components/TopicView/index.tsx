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
import { FinalTestSection } from "./FinalTestSection";
import { LoadingSection } from "./LoadingSection";
import { PartSection } from "./PartSection";
import {
  ASSESSMENT_EVAL_SYSTEM,
  ASSESSMENT_SYSTEM,
  GRADING_SYSTEM,
  HANDS_ON_EVAL_SYSTEM,
  PART_SYSTEM,
  PLAN_SYSTEM,
  WRITEUP_SYSTEM,
} from "./prompts";
import type { Material, PersistedPhase, SessionPhase } from "./types";
import { Spinner } from "./ui";
import { parseJSON, parsePart, parsePlan } from "./utils";

const TOKENS_PLAN = 600;
const TOKENS_PART = 3000;
const TOKENS_ASSESSMENT = 300;
const TOKENS_ASSESSMENT_EVAL = 300;
const TOKENS_HANDS_ON_EVAL = 500;
const TOKENS_WRITEUP = 250;
const TOKENS_GRADING = 300;

function restorePhase(p: PersistedPhase): SessionPhase {
  if (p.name === "part") {
    return {
      ...p,
      userText: "",
      handsOnAnswers: {},
      feedbackStreaming: false,
      stream: "",
      // if part content is missing (was generating when user left), restart generation
      step: p.material.parts[p.partIdx] ? p.step : "generating",
    };
  }
  if (p.name === "final-test") return { ...p, answers: {} };
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
            setPhase((prev) => (prev.name === "part" ? { ...prev, stream: acc } : prev));
          }
        },
        TOKENS_PART,
        ctrl.signal,
      );
      if (ctrl.signal.aborted) return;

      const studyPart = parsePart(text);
      const updatedParts = material.parts.map((p, i) => (i === partIdx ? studyPart : p));
      const updatedMaterial = { ...material, parts: updatedParts };

      setPhase((prev) =>
        prev.name === "part" ? { ...prev, material: updatedMaterial, step: "study", stream: "" } : prev,
      );
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

      setPhase({
        name: "part",
        material,
        partIdx: 0,
        step: "generating",
        stream: "",
        userText: "",
        handsOnAnswers: {},
        feedback: "",
        feedbackStreaming: false,
      });
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
    setPhase((prev) =>
      prev.name === "part"
        ? { ...prev, step: "hands-on", userText: "", handsOnAnswers: answers, feedback: "", feedbackStreaming: true }
        : prev,
    );
    try {
      await streamAI(
        HANDS_ON_EVAL_SYSTEM,
        qa,
        (acc) => {
          if (!ctrl.signal.aborted) {
            setPhase((prev) => (prev.name === "part" ? { ...prev, feedback: acc } : prev));
          }
        },
        TOKENS_HANDS_ON_EVAL,
        ctrl.signal,
      );
      if (!ctrl.signal.aborted)
        setPhase((prev) => (prev.name === "part" ? { ...prev, feedbackStreaming: false } : prev));
    } catch (err) {
      if (!ctrl.signal.aborted) setPhase({ name: "error", message: String(err) });
    }
  }

  async function submitWriteUp(partIdx: number, material: Material, text: string) {
    const ctrl = newAbort();
    const part = material.parts[partIdx];
    if (!part) return;
    setPhase((prev) =>
      prev.name === "part"
        ? { ...prev, step: "write-up", userText: text, handsOnAnswers: {}, feedback: "", feedbackStreaming: true }
        : prev,
    );
    try {
      await streamAI(
        WRITEUP_SYSTEM,
        `Topic: "${part.title}"\nLearner's reflection: "${text}"`,
        (acc) => {
          if (!ctrl.signal.aborted) {
            setPhase((prev) => (prev.name === "part" ? { ...prev, feedback: acc } : prev));
          }
        },
        TOKENS_WRITEUP,
        ctrl.signal,
      );
      if (!ctrl.signal.aborted) {
        setPhase((prev) => (prev.name === "part" ? { ...prev, feedbackStreaming: false } : prev));
      }
    } catch (err) {
      if (!ctrl.signal.aborted) setPhase({ name: "error", message: String(err) });
    }
  }

  async function submitFinalTest(material: Material, answers: Record<number, string>) {
    if (!task) return;
    const ctrl = newAbort();
    setPhase({ name: "final-test", material, answers, grading: "", gradingDone: false, passed: false });

    const qa = material.plan.finalTest
      .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${answers[i] ?? "(no answer)"}`)
      .join("\n\n");

    try {
      const gradingText = await streamAI(
        GRADING_SYSTEM,
        `Topic: "${task.title}"\n\nTest answers:\n${qa}`,
        (acc) => {
          if (!ctrl.signal.aborted) {
            setPhase({ name: "final-test", material, answers, grading: acc, gradingDone: false, passed: false });
          }
        },
        TOKENS_GRADING,
        ctrl.signal,
      );
      if (ctrl.signal.aborted) return;
      const { passed, feedback } = parseJSON<{ score: number; passed: boolean; feedback: string }>(gradingText);
      if (passed && !isCompleted) await toggleTask(task.id);
      setPhase({ name: "final-test", material, answers, grading: feedback, gradingDone: true, passed });
    } catch (err) {
      if (!ctrl.signal.aborted) setPhase({ name: "error", message: String(err) });
    }
  }

  function handleNextPart() {
    if (phase.name !== "part") return;
    const nextIdx = phase.partIdx + 1;
    const { material } = phase;

    if (nextIdx >= material.plan.partPlans.length) {
      setPhase({ name: "final-test", material, answers: {}, grading: "", gradingDone: false, passed: false });
      return;
    }

    if (material.parts[nextIdx]) {
      setPhase((prev) =>
        prev.name === "part"
          ? {
              ...prev,
              partIdx: nextIdx,
              step: "study",
              stream: "",
              userText: "",
              handsOnAnswers: {},
              feedback: "",
              feedbackStreaming: false,
            }
          : prev,
      );
    } else {
      // Set generating state then call loadPart
      const nextMaterial = material;
      setPhase((prev) =>
        prev.name === "part"
          ? {
              ...prev,
              partIdx: nextIdx,
              step: "generating",
              stream: "",
              userText: "",
              handsOnAnswers: {},
              feedback: "",
              feedbackStreaming: false,
            }
          : prev,
      );
      void loadPart(nextIdx, nextMaterial);
    }
  }

  function handleGoToPart(idx: number) {
    if (phase.name !== "part" || !phase.material.parts[idx]) return;
    setPhase((prev) =>
      prev.name === "part"
        ? {
            ...prev,
            partIdx: idx,
            step: "study",
            stream: "",
            userText: "",
            handsOnAnswers: {},
            feedback: "",
            feedbackStreaming: false,
          }
        : prev,
    );
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
            if (restored.name === "part" && restored.step === "generating") {
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

    if (phase.name === "part" && !phase.feedbackStreaming && phase.step !== "generating") {
      void apiClient.api["topic-sessions"][":taskId"].$put({
        param: { taskId },
        json: {
          phaseData: {
            name: "part",
            material: phase.material,
            partIdx: phase.partIdx,
            step: phase.step,
            feedback: phase.feedback,
          },
        },
      });
    } else if (phase.name === "final-test" && (phase.grading === "" || phase.gradingDone)) {
      void apiClient.api["topic-sessions"][":taskId"].$put({
        param: { taskId },
        json: {
          phaseData: {
            name: "final-test",
            material: phase.material,
            grading: phase.grading,
            gradingDone: phase.gradingDone,
            passed: phase.passed,
          },
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
          {(phase.name === "part" || phase.name === "final-test") && (
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
      {phase.name === "part" && (
        <PartSection
          phase={phase}
          onUpdateText={(text) => setPhase((prev) => (prev.name === "part" ? { ...prev, userText: text } : prev))}
          onAnswerChange={(idx, text) =>
            setPhase((prev) =>
              prev.name === "part" ? { ...prev, handsOnAnswers: { ...prev.handsOnAnswers, [idx]: text } } : prev,
            )
          }
          onNextStep={() =>
            setPhase((prev) => {
              if (prev.name !== "part") return prev;
              if (prev.step === "study")
                return { ...prev, step: "hands-on", handsOnAnswers: {}, userText: "", feedback: "" };
              if (prev.step === "hands-on")
                return { ...prev, step: "write-up", handsOnAnswers: {}, userText: "", feedback: "" };
              return prev;
            })
          }
          onSubmitHandsOn={() => {
            if (phase.name === "part") void submitHandsOn(phase.partIdx, phase.material, phase.handsOnAnswers);
          }}
          onSubmitWriteUp={() => {
            if (phase.name === "part") void submitWriteUp(phase.partIdx, phase.material, phase.userText);
          }}
          onNextPart={handleNextPart}
          onGoToPart={handleGoToPart}
        />
      )}
      {phase.name === "final-test" && (
        <FinalTestSection
          phase={phase}
          onAnswerChange={(idx, text) =>
            setPhase((prev) =>
              prev.name === "final-test" ? { ...prev, answers: { ...prev.answers, [idx]: text } } : prev,
            )
          }
          onSubmit={() => {
            if (phase.name === "final-test") void submitFinalTest(phase.material, phase.answers);
          }}
          onComplete={() =>
            setPhase((prev) =>
              prev.name === "final-test" ? (prev.passed ? { name: "complete" } : { name: "choice" }) : prev,
            )
          }
        />
      )}
      {phase.name === "complete" && <CompleteSection taskTitle={task.title} onBack={goBack} onStartOver={startOver} />}
      {phase.name === "error" && <ErrorSection message={phase.message} onRetry={() => setPhase({ name: "choice" })} />}
    </div>
  );
}
