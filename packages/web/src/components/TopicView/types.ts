export type HandsOnTask = { task: string; hint?: string };

export type PartPlan = { title: string; description: string };

export type MaterialPlan = {
  partPlans: PartPlan[];
  finalTest: Array<{ question: string; hint?: string }>;
};

export type StudyPart = {
  title: string;
  study: string;
  handsOn: HandsOnTask[];
  writeUpPrompt: string;
};

export type Material = {
  plan: MaterialPlan;
  parts: (StudyPart | null)[];
  assessmentContext?: string;
};

export type PersistedPhase =
  | {
      name: "part";
      material: Material;
      partIdx: number;
      step: "study" | "hands-on" | "write-up";
      feedback: string;
    }
  | {
      name: "final-test";
      material: Material;
      grading: string;
      gradingDone: boolean;
      passed: boolean;
    }
  | { name: "gaps-review"; summary: string; gaps: string[]; context: string };

export type SessionPhase =
  | { name: "init" }
  | { name: "choice" }
  | {
      name: "assessing";
      status: "loading" | "answering" | "evaluating";
      questions: string[];
      answers: Record<number, string>;
      evalStream: string;
    }
  | { name: "loading"; stream: string }
  | {
      name: "part";
      material: Material;
      partIdx: number;
      step: "generating" | "study" | "hands-on" | "write-up";
      stream: string;
      userText: string;
      handsOnAnswers: Record<number, string>;
      feedback: string;
      feedbackStreaming: boolean;
    }
  | {
      name: "final-test";
      material: Material;
      answers: Record<number, string>;
      grading: string;
      gradingDone: boolean;
      passed: boolean;
    }
  | { name: "gaps-review"; summary: string; gaps: string[]; context: string }
  | { name: "complete" }
  | { name: "error"; message: string };
