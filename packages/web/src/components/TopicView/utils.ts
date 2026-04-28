import type { Material } from "./types";

export function parseJSON<T>(text: string): T {
  const withoutFences = text
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();
  try {
    return JSON.parse(withoutFences) as T;
  } catch {
    const match = withoutFences.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match?.[1]) return JSON.parse(match[1]) as T;
    throw new Error(`Could not parse JSON from AI response. Raw: ${withoutFences.slice(0, 120)}`);
  }
}

export function parseMaterial(text: string): Material {
  const raw = parseJSON<Partial<Material>>(text);
  return {
    parts: Array.isArray(raw.parts) ? raw.parts : [],
    finalTest: Array.isArray(raw.finalTest) ? raw.finalTest : [],
  };
}
