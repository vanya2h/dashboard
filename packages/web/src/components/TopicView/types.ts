export type HandsOnTask = { task: string; hint?: string };

export type PartPlan = { title: string; description: string };

export type MaterialPlan = {
  partPlans: PartPlan[];
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
  | { name: "study"; material: Material; partIdx: number }
  | { name: "hands-on"; material: Material; partIdx: number; feedback: string }
  | { name: "write-up"; material: Material; partIdx: number; feedback: string }
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
      name: "study";
      material: Material;
      partIdx: number;
      stream: string;
    }
  | {
      name: "hands-on";
      material: Material;
      partIdx: number;
      answers: Record<number, string>;
      feedback: string;
      feedbackStreaming: boolean;
    }
  | {
      name: "write-up";
      material: Material;
      partIdx: number;
      text: string;
      feedback: string;
      feedbackStreaming: boolean;
    }
  | {
      name: "gaps-review";
      summary: string;
      gaps: string[];
      context: string;
    }
  | { name: "complete" }
  | { name: "error"; message: string };
