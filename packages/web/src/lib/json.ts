import { jsonrepair } from "jsonrepair";

export function parseJSON<T>(text: string): T {
  return JSON.parse(jsonrepair(text));
}
