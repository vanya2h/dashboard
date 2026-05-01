import { parseJSON } from "./json";

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
  | { name: "assessing"; questions: string[]; answers: Record<number, string> }
  | { name: "gaps-review"; summary: string; gaps: string[]; context: string }
  | { name: "study"; material: Material; partIdx: number }
  | { name: "hands-on"; material: Material; partIdx: number; answers: Record<number, string> }
  | { name: "feedback"; material: Material; partIdx: number; answers: Record<number, string>; feedback: string }
  | { name: "write-up"; material: Material; partIdx: number; feedback: string };

export type StepKey = "study" | "hands-on" | "feedback" | "write-up";

export const PHASE_ROUTES = {
  assessing: "assess",
  "gaps-review": "gaps",
  study: "study",
  "hands-on": "hands-on",
  feedback: "feedback",
  "write-up": "write-up",
} as const satisfies Record<PersistedPhase["name"], string>;

export const PLAN_SYSTEM = `You are an expert tutor planning a structured study session for a senior software developer.
Respond with ONLY valid JSON — no explanation outside the JSON:
{
  "partPlans": [
    { "title": "concise part title", "description": "one sentence: what this part covers and why it matters" }
  ]
}
Rules:
- 2-4 parts, ordered foundational to advanced
- Every part must close a gap the assessment exposed — skip topics the learner already knows`;

export const PART_SYSTEM = `You are an expert tutor generating study content for one part of a session for a senior software developer.
Respond with ONLY valid JSON — no explanation outside the JSON:
{
  "title": "same title as given",
  "study": "explanation in **markdown** (150-250 words). Use headings, bullet lists, bold for key terms, and fenced code blocks with an explicit language tag (typescript, python, bash, etc.) for every code snippet.",
  "handsOn": [
    { "task": "concrete task in **markdown**. Use fenced code blocks with an explicit language tag for any code.", "hint": "optional hint or empty string" }
  ],
  "writeUpPrompt": "one targeted reflection question (plain text)"
}
Rules:
- Study: 150-250 words — explain the WHY and trade-offs; include at least one code example
- Hands-on: 2-3 tasks ordered simple to complex
- Scope tightly to this part's title — do not duplicate content from the other parts listed
- Be concise`;

export const ASSESSMENT_SYSTEM = `You are an expert tutor generating a quick knowledge assessment.
Respond with ONLY valid JSON — no markdown, no explanation:
{ "questions": ["question 1", "question 2", "question 3", "question 4"] }
Requirements: exactly several short-answer questions, test genuine understanding not memorization, reveal gaps when answered poorly, each answerable in 1-3 sentences.`;

export const ASSESSMENT_EVAL_SYSTEM = `You are an expert tutor analyzing assessment answers.
Respond with ONLY valid JSON — no markdown, no explanation:
{ "summary": "1 sentence on current knowledge level", "gaps": ["concept needing focus", ...] }
Be accurate. gaps can be empty array. Max 3 gaps.`;

export const HANDS_ON_EVAL_SYSTEM = `You are a concise, direct tutor reviewing a learner's hands-on exercise solutions. Respond in markdown. Use fenced code blocks with an explicit language tag (typescript, python, bash, etc.) whenever referencing code. Keep response under 200 words.
For each task: 1 sentence on what they got right and 1 sentence on the most important gap or misconception.
End with 1-2 sentences of concrete next steps to deepen understanding.
Be honest — vague praise is useless.`;

export const WRITEUP_SYSTEM = `You are a concise, supportive tutor reviewing a learner's reflection. Respond in markdown. Keep response under 100 words.
1 sentence: acknowledge what they captured well.
1-2 sentences: the most important thing to think more deeply about.
1 sentence: one concrete suggestion for deepening understanding.`;

export const TASK_SOLUTION_SYSTEM = `You are an expert tutor providing a complete solution to a hands-on programming task for a senior developer.
Respond in markdown. Use fenced code blocks with an explicit language tag for all code.
Show the full working solution with a brief explanation of the key decisions.
Keep response under 500 words.`;

export function parsePlan(text: string): MaterialPlan {
  const raw = parseJSON<Partial<MaterialPlan>>(text);
  return {
    partPlans: Array.isArray(raw.partPlans) ? raw.partPlans : [],
  };
}

export function parsePart(text: string): StudyPart {
  const raw = parseJSON<Partial<StudyPart>>(text);
  return {
    title: raw.title ?? "",
    study: raw.study ?? "",
    handsOn: Array.isArray(raw.handsOn) ? raw.handsOn : [],
    writeUpPrompt: raw.writeUpPrompt ?? "",
  };
}
