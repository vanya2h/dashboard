#!/usr/bin/env tsx
/**
 * Token usage measurement script for the topic session flow.
 *
 * Runs all 7 AI steps (plan+part architecture) with static user inputs.
 * Usage (from repo root): pnpm --filter web run measure-tokens
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  ASSESSMENT_EVAL_SYSTEM,
  ASSESSMENT_SYSTEM,
  GRADING_SYSTEM,
  HANDS_ON_EVAL_SYSTEM,
  PART_SYSTEM,
  PLAN_SYSTEM,
  WRITEUP_SYSTEM,
} from "../src/components/TopicView/prompts.js";
import { parseJSON } from "../src/lib/json.js";
import { parsePart, parsePlan } from "../src/lib/phase.js";

// ---------------------------------------------------------------------------
// Static inputs — simulates a "median" session on TypeScript Conditional Types
// ---------------------------------------------------------------------------

const TOPIC = "TypeScript Conditional Types & the `infer` Keyword";
const CURRICULUM = "TypeScript Mastery";

// Learner knows basic generics but struggles with conditional types / infer
const STATIC_ASSESSMENT_ANSWERS: string[] = [
  "Generics let you write reusable code that works with multiple types. For example Array<T> or function identity<T>(x: T): T. The type variable T is filled in at the call site.",
  "You add constraints with 'extends': function first<T extends any[]>(arr: T): T[0]. This restricts what types T can be.",
  "Conditional types look like T extends U ? X : Y — so you get type X if T is assignable to U and Y otherwise. I've seen them in utility types but I find the syntax confusing.",
  "I've heard of infer but I'm not confident using it. I think it lets you capture a type inside a conditional type expression, but I'm not sure of the exact syntax.",
];

const STATIC_HANDSON_ANSWERS: string[] = [
  `I defined the type using infer:

\`\`\`typescript
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type A = UnwrapPromise<Promise<string>>; // string
type B = UnwrapPromise<number>;           // number
\`\`\`

I used \`infer U\` to capture the resolved type. I wasn't sure whether infer goes in extends or the true-branch at first.`,

  `Here's my deep-readonly mapped type:

\`\`\`typescript
type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K] };
\`\`\`

I'm not sure this handles arrays correctly — the elements are still mutable.`,

  `Building Parameters from scratch:

\`\`\`typescript
type MyParameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
\`\`\`

The function constraint was needed to tell TS that T must be callable.`,
];

const STATIC_WRITEUP =
  "I now understand that conditional types are TypeScript's way of expressing type-level logic. The `infer` keyword acts like a local variable inside the conditional type, letting you capture and reuse a matched sub-type. I found it hard to remember that infer only works inside the extends clause. I'll practice rebuilding standard utility types like ReturnType and Awaited from scratch.";

const STATIC_FINAL_ANSWERS: string[] = [
  "A conditional type `T extends U ? X : Y` evaluates to X if T is assignable to U, otherwise Y. It lets you encode type-level branching similar to a runtime ternary.",
  "The `infer` keyword introduces a type variable inferred from the matched pattern. `T extends Promise<infer U> ? U : never` captures the Promise's resolved type into U.",
  "Distributive conditional types distribute over union members for naked type parameters. `Exclude<A | B, A>` becomes `(A extends A ? never : A) | (B extends A ? never : B)`. Wrapping in a tuple disables distribution.",
  "ReturnType<T> is `T extends (...args: any) => infer R ? R : never`. It uses infer on the return position of the function signature.",
  "Mapped types with conditional types can transform each property selectively, e.g. making only function-valued properties optional.",
  "Template literal types combine with conditional types for type-level string manipulation, like extracting route params from a path string type.",
];

// ---------------------------------------------------------------------------
// API call helper — uses non-streaming create() to get usage counts
// ---------------------------------------------------------------------------

const MODEL = "claude-sonnet-4-6";
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type StepResult = { step: string; inputTokens: number; outputTokens: number; totalTokens: number; ms: number };

const steps: StepResult[] = [];

async function callStep(stepName: string, system: string, userMessage: string, maxTokens = 8000): Promise<string> {
  process.stdout.write(`  → ${stepName} ... `);
  const start = Date.now();

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userMessage }],
  });

  const ms = Date.now() - start;
  const { input_tokens, output_tokens } = msg.usage;

  steps.push({
    step: stepName,
    inputTokens: input_tokens,
    outputTokens: output_tokens,
    totalTokens: input_tokens + output_tokens,
    ms,
  });
  process.stdout.write(
    `${input_tokens.toLocaleString()} in / ${output_tokens.toLocaleString()} out (${(ms / 1000).toFixed(1)}s)\n`,
  );

  const block = msg.content[0];
  return block.type === "text" ? block.text : "";
}

// ---------------------------------------------------------------------------
// Main flow — mirrors the new plan+part architecture
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY not set (checked env + .env)");
    process.exit(1);
  }

  console.log("\nToken Measurement — Plan+Part Architecture");
  console.log(`Topic     : ${TOPIC}`);
  console.log(`Curriculum: ${CURRICULUM}`);
  console.log(`Model     : ${MODEL}`);
  console.log("─".repeat(72));

  // Step 1: Generate assessment questions
  const questionsText = await callStep(
    "1. Assessment Questions",
    ASSESSMENT_SYSTEM,
    `Topic: "${TOPIC}"\nCurriculum: ${CURRICULUM}`,
  );
  const { questions } = parseJSON<{ questions: string[] }>(questionsText);

  // Step 2: Evaluate assessment answers
  const assessmentQA = questions
    .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${STATIC_ASSESSMENT_ANSWERS[i] ?? "(no answer)"}`)
    .join("\n\n");

  const evalText = await callStep(
    "2. Assessment Evaluation",
    ASSESSMENT_EVAL_SYSTEM,
    `Topic: "${TOPIC}"\n\nAssessment:\n${assessmentQA}`,
  );
  const { summary, gaps } = parseJSON<{ summary: string; gaps: string[] }>(evalText);
  const assessmentContext =
    gaps.length > 0
      ? `Learner level: ${summary}. Key gaps to focus on: ${gaps.join(", ")}.`
      : `Learner level: ${summary}. Knowledge is solid — go deep and cover advanced nuances.`;

  // Step 3: Generate plan (new — replaces single material generation call)
  const planText = await callStep(
    "3. Plan Generation (new)",
    PLAN_SYSTEM,
    `Plan a study session for: "${TOPIC}"\nCurriculum: ${CURRICULUM}\n\nAssessment context: ${assessmentContext}`,
  );
  const plan = parsePlan(planText);
  console.log(`     → ${plan.partPlans.length} parts planned: ${plan.partPlans.map((p) => p.title).join(", ")}`);

  // Steps 4-6: Generate each part on-demand, then evaluate hands-on + write-up
  const otherParts = plan.partPlans.map((p, i) => `${i + 1}. ${p.title}: ${p.description}`).join("\n");
  const n = plan.partPlans.length;

  for (let i = 0; i < n; i++) {
    const partPlan = plan.partPlans[i]!;
    const label = `Part ${i + 1}/${n}`;

    const partText = await callStep(
      `4.${i + 1}. ${label} Generation (on-demand)`,
      PART_SYSTEM,
      [
        `Topic: "${TOPIC}"`,
        `Curriculum: ${CURRICULUM}`,
        `Assessment context: ${assessmentContext}`,
        ``,
        `Generate part ${i + 1} of ${n}: "${partPlan.title}"`,
        `Scope: ${partPlan.description}`,
        ``,
        `Full session outline:`,
        otherParts,
      ].join("\n"),
      1500,
    );
    const part = parsePart(partText);

    const handsOnQA = part.handsOn
      .map((t, j) => `Task ${j + 1}: ${t.task}\nAnswer ${j + 1}: ${STATIC_HANDSON_ANSWERS[j] ?? "(no answer)"}`)
      .join("\n\n");
    await callStep(`5.${i + 1}. ${label} Hands-on Evaluation`, HANDS_ON_EVAL_SYSTEM, handsOnQA);

    await callStep(
      `6.${i + 1}. ${label} Write-up Evaluation`,
      WRITEUP_SYSTEM,
      `Topic: "${part.title}"\nLearner's reflection: "${STATIC_WRITEUP}"`,
    );
  }

  // Step 7: Final test grading
  const finalQA = plan.finalTest
    .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${STATIC_FINAL_ANSWERS[i] ?? "(no answer)"}`)
    .join("\n\n");
  await callStep("7. Final Test Grading", GRADING_SYSTEM, `Topic: "${TOPIC}"\n\nTest answers:\n${finalQA}`);

  // ---------------------------------------------------------------------------
  // Report
  // ---------------------------------------------------------------------------

  const COL = { step: 42, num: 9 };
  console.log("\n" + "═".repeat(76));
  console.log("  TOKEN USAGE REPORT");
  console.log("═".repeat(76));
  console.log(
    "  " +
      "Step".padEnd(COL.step) +
      "Input".padStart(COL.num) +
      "Output".padStart(COL.num) +
      "Total".padStart(COL.num) +
      "Time".padStart(COL.num),
  );
  console.log("  " + "─".repeat(74));

  let totalIn = 0,
    totalOut = 0,
    totalMs = 0;
  for (const s of steps) {
    totalIn += s.inputTokens;
    totalOut += s.outputTokens;
    totalMs += s.ms;
    console.log(
      "  " +
        s.step.padEnd(COL.step) +
        s.inputTokens.toLocaleString().padStart(COL.num) +
        s.outputTokens.toLocaleString().padStart(COL.num) +
        s.totalTokens.toLocaleString().padStart(COL.num) +
        `${(s.ms / 1000).toFixed(1)}s`.padStart(COL.num),
    );
  }

  console.log("  " + "─".repeat(74));
  console.log(
    "  " +
      "TOTAL".padEnd(COL.step) +
      totalIn.toLocaleString().padStart(COL.num) +
      totalOut.toLocaleString().padStart(COL.num) +
      (totalIn + totalOut).toLocaleString().padStart(COL.num) +
      `${(totalMs / 1000).toFixed(1)}s`.padStart(COL.num),
  );
  console.log("═".repeat(76));

  // claude-sonnet-4-6 pricing: $3/MTok input, $15/MTok output
  const inputCost = (totalIn / 1_000_000) * 3.0;
  const outputCost = (totalOut / 1_000_000) * 15.0;
  const totalCost = inputCost + outputCost;
  console.log(
    `\n  Cost estimate (Sonnet 4.6 list price):` +
      `\n    Input:  $${inputCost.toFixed(5)}` +
      `\n    Output: $${outputCost.toFixed(5)}` +
      `\n    Total:  $${totalCost.toFixed(5)}` +
      `\n  (Full session: ${plan.partPlans.length} parts + final test)`,
  );
  console.log();
}

main().catch((err: unknown) => {
  console.error("\nFatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
