import { jsonrepair } from "jsonrepair";
import type { MaterialPlan, StudyPart } from "./types";

export function parseJSON<T>(text: string): T {
  const withoutFences = text
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();

  try {
    return JSON.parse(withoutFences) as T;
  } catch {
    // jsonrepair handles unescaped quotes, literal newlines, trailing commas, etc.
    try {
      return JSON.parse(jsonrepair(withoutFences)) as T;
    } catch {
      // try extracting the outermost object/array first, then repair
      const match = withoutFences.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (match?.[1]) {
        try {
          return JSON.parse(jsonrepair(match[1])) as T;
        } catch {
          // fall through
        }
      }
    }
  }

  throw new Error(`Could not parse JSON from AI response. Raw: ${withoutFences.slice(0, 200)}`);
}

export function parsePlan(text: string): MaterialPlan {
  const raw = parseJSON<Partial<MaterialPlan>>(text);
  return {
    partPlans: Array.isArray(raw.partPlans) ? raw.partPlans : [],
  };
}

export function extractStudy(raw: string): string {
  const match = raw.match(/"study"\s*:\s*"((?:[^"\\]|\\[\s\S])*)(?:"|$)/s);
  if (!match?.[1]) return "";
  return match[1].replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
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
