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
  MATERIAL_SYSTEM,
  WRITEUP_SYSTEM,
} from "./prompts";
import type { Material, PersistedPhase, SessionPhase } from "./types";
import { Spinner } from "./ui";
import { parseJSON, parseMaterial } from "./utils";

function restorePhase(p: PersistedPhase): SessionPhase {
  if (p.name === "part") return { ...p, userText: "", feedbackStreaming: false };
  if (p.name === "final-test") return { ...p, answers: {} };
  return { name: "choice" };
}

export function TopicView() {
  const { curriculumId, taskId } = useParams<{ curriculumId: string; taskId: string }>();
  const navigate = useNavigate();
  const { completedTaskIds, toggleTask } = useProgress();

  const { streamAI, askAI } = useClaude();
  const [phase, setPhase] = useState<SessionPhase>({ name: "init" });
  const abortRef = useRef<AbortController | null>(null);
  const sessionLoadedRef = useRef(false);

  // Load persisted session on mount
  useEffect(() => {
    if (!taskId) return; // guaranteed by router; don't setState synchronously
    let cancelled = false;
    apiClient.api["topic-sessions"][":taskId"]
      .$get({ param: { taskId } })
      .then((r) => r.json())
      .then(({ phaseData }) => {
        if (!cancelled) {
          setPhase(phaseData ? restorePhase(phaseData as unknown as PersistedPhase) : { name: "choice" });
          sessionLoadedRef.current = true;
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

    if (phase.name === "part" && !phase.feedbackStreaming) {
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
    } else if (phase.name === "complete") {
      void apiClient.api["topic-sessions"][":taskId"].$delete({ param: { taskId } });
    }
  }, [phase, taskId]);

  useEffect(() => () => abortRef.current?.abort(), []);

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

  const goBack = () => navigate(`/curriculum/${curriculumId}`);

  useEffect(() => {
    if (!task || !curriculum) goBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!task || !curriculum) return null;

  const isCompleted = !!completedTaskIds[task.id];

  function newAbort() {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    return ctrl;
  }

  async function loadMaterial(assessmentContext?: string) {
    const ctrl = newAbort();
    setPhase({ name: "loading", stream: "" });

    const userMsg = assessmentContext
      ? `Create a study session for: "${task!.title}"\nCurriculum: ${curriculum!.name}\n\nAssessment context: ${assessmentContext}`
      : `Create a study session for: "${task!.title}"\nCurriculum: ${curriculum!.name}`;

    try {
      const text = await streamAI(
        MATERIAL_SYSTEM,
        userMsg,
        (acc) => {
          if (!ctrl.signal.aborted) setPhase({ name: "loading", stream: acc });
        },
        ctrl.signal,
      );
      if (ctrl.signal.aborted) return;
      const material = parseMaterial(text);
      if (material.parts.length === 0) throw new Error("AI returned no study parts. Please try again.");
      setPhase({
        name: "part",
        material,
        partIdx: 0,
        step: "study",
        userText: "",
        feedback: "",
        feedbackStreaming: false,
      });
    } catch (err) {
      if (!ctrl.signal.aborted) setPhase({ name: "error", message: String(err) });
    }
  }

  async function startAssessment() {
    const ctrl = newAbort();
    setPhase({ name: "assessing", status: "loading", questions: [], answers: {}, evalStream: "" });
    try {
      const text = await askAI(
        ASSESSMENT_SYSTEM,
        `Topic: "${task!.title}"\nCurriculum: ${curriculum!.name}`,
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
    const ctrl = newAbort();
    setPhase({ name: "assessing", status: "evaluating", questions, answers, evalStream: "" });

    const qa = questions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] ?? "(no answer)"}`).join("\n\n");

    try {
      const evalText = await streamAI(
        ASSESSMENT_EVAL_SYSTEM,
        `Topic: "${task!.title}"\n\nAssessment:\n${qa}`,
        (acc) => {
          if (!ctrl.signal.aborted)
            setPhase({ name: "assessing", status: "evaluating", questions, answers, evalStream: acc });
        },
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

  async function submitHandsOn(partIdx: number, material: Material, text: string) {
    const ctrl = newAbort();
    const part = material.parts[partIdx]!;
    setPhase({
      name: "part",
      material,
      partIdx,
      step: "hands-on",
      userText: text,
      feedback: "",
      feedbackStreaming: true,
    });
    try {
      await streamAI(
        HANDS_ON_EVAL_SYSTEM,
        `Exercise: "${part.handsOn}"\nLearner's solution: "${text}"`,
        (acc) => {
          if (!ctrl.signal.aborted)
            setPhase({
              name: "part",
              material,
              partIdx,
              step: "hands-on",
              userText: text,
              feedback: acc,
              feedbackStreaming: true,
            });
        },
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
    const part = material.parts[partIdx]!;
    setPhase({
      name: "part",
      material,
      partIdx,
      step: "write-up",
      userText: text,
      feedback: "",
      feedbackStreaming: true,
    });
    try {
      await streamAI(
        WRITEUP_SYSTEM,
        `Topic: "${part.title}"\nLearner's reflection: "${text}"`,
        (acc) => {
          if (!ctrl.signal.aborted) {
            setPhase({
              name: "part",
              material,
              partIdx,
              step: "write-up",
              userText: text,
              feedback: acc,
              feedbackStreaming: true,
            });
          }
        },
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
    const ctrl = newAbort();
    setPhase({ name: "final-test", material, answers, grading: "", gradingDone: false, passed: false });

    const qa = material.finalTest
      .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${answers[i] ?? "(no answer)"}`)
      .join("\n\n");

    try {
      const gradingText = await streamAI(
        GRADING_SYSTEM,
        `Topic: "${task!.title}"\n\nTest answers:\n${qa}`,
        (acc) => {
          if (!ctrl.signal.aborted) {
            setPhase({ name: "final-test", material, answers, grading: acc, gradingDone: false, passed: false });
          }
        },
        ctrl.signal,
      );
      if (ctrl.signal.aborted) return;
      const { passed, feedback } = parseJSON<{ score: number; passed: boolean; feedback: string }>(gradingText);
      if (passed && !isCompleted) await toggleTask(task!.id);
      setPhase({ name: "final-test", material, answers, grading: feedback, gradingDone: true, passed });
    } catch (err) {
      if (!ctrl.signal.aborted) setPhase({ name: "error", message: String(err) });
    }
  }

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
        {isCompleted && (
          <span className="ml-auto shrink-0 text-xs text-green-600 dark:text-green-400 font-medium">✓ Completed</span>
        )}
      </header>

      {phase.name === "init" && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner />
        </div>
      )}
      {phase.name === "choice" && <ChoiceSection onScratch={() => loadMaterial()} onAssess={() => startAssessment()} />}
      {phase.name === "assessing" && (
        <AssessmentSection
          phase={phase}
          onAnswerChange={(idx, text) =>
            setPhase((prev) =>
              prev.name === "assessing" ? { ...prev, answers: { ...prev.answers, [idx]: text } } : prev,
            )
          }
          onSubmit={() => {
            if (phase.name === "assessing") submitAssessment(phase.questions, phase.answers);
          }}
        />
      )}
      {phase.name === "gaps-review" && (
        <GapsReviewSection phase={phase} onContinue={() => loadMaterial(phase.context)} />
      )}
      {phase.name === "loading" && <LoadingSection />}
      {phase.name === "part" && (
        <PartSection
          phase={phase}
          onUpdateText={(text) => setPhase((prev) => (prev.name === "part" ? { ...prev, userText: text } : prev))}
          onNextStep={() =>
            setPhase((prev) => {
              if (prev.name !== "part") return prev;
              if (prev.step === "study") return { ...prev, step: "hands-on", userText: "", feedback: "" };
              if (prev.step === "hands-on") return { ...prev, step: "write-up", userText: "", feedback: "" };
              return prev;
            })
          }
          onSubmitHandsOn={() => {
            if (phase.name === "part") submitHandsOn(phase.partIdx, phase.material, phase.userText);
          }}
          onSubmitWriteUp={() => {
            if (phase.name === "part") submitWriteUp(phase.partIdx, phase.material, phase.userText);
          }}
          onNextPart={() =>
            setPhase((prev) => {
              if (prev.name !== "part") return prev;
              const nextIdx = prev.partIdx + 1;
              if (nextIdx < prev.material.parts.length) {
                return {
                  ...prev,
                  partIdx: nextIdx,
                  step: "study",
                  userText: "",
                  feedback: "",
                  feedbackStreaming: false,
                };
              }
              return {
                name: "final-test",
                material: prev.material,
                answers: {},
                grading: "",
                gradingDone: false,
                passed: false,
              };
            })
          }
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
            if (phase.name === "final-test") submitFinalTest(phase.material, phase.answers);
          }}
          onComplete={() =>
            setPhase((prev) =>
              prev.name === "final-test" ? (prev.passed ? { name: "complete" } : { name: "choice" }) : prev,
            )
          }
        />
      )}
      {phase.name === "complete" && <CompleteSection taskTitle={task.title} onBack={goBack} />}
      {phase.name === "error" && <ErrorSection message={phase.message} onRetry={() => setPhase({ name: "choice" })} />}
    </div>
  );
}
