import { describe, expect, it } from "vitest";
import { parsePart } from "./phase";

describe("parsePart", () => {
  it("parses complete JSON", () => {
    const json = `{"title":"Closures","study":"A closure captures its lexical scope.","handsOn":[],"writeUpPrompt":"Reflect."}`;
    expect(parsePart(json).study).toBe("A closure captures its lexical scope.");
  });

  it("extracts partial study from mid-stream JSON (no closing quote)", () => {
    const partial = `{"title":"Closures","study":"A closure captures its`;
    expect(parsePart(partial).study).toBe("A closure captures its");
  });

  it("returns empty string when no study field present", () => {
    expect(parsePart(`{"title":"foo","handsOn":[]}`).study).toBe("");
  });

  it("unescapes \\n to newline", () => {
    const json = `{"study":"line1\\nline2"}`;
    expect(parsePart(json).study).toBe("line1\nline2");
  });

  it("unescapes \\t to tab", () => {
    const json = `{"study":"col1\\tcol2"}`;
    expect(parsePart(json).study).toBe("col1\tcol2");
  });

  it('unescapes \\" to double quote', () => {
    const json = `{"study":"say \\"hello\\""}`;
    expect(parsePart(json).study).toBe(`say "hello"`);
  });

  it("unescapes \\\\ to single backslash", () => {
    const json = `{"study":"path\\\\to\\\\dir"}`;
    expect(parsePart(json).study).toBe("path\\to\\dir");
  });

  it("handles realistic markdown content with code block", () => {
    const json =
      `{"study":"## Closures\\n\\nA **closure** is a function that retains access to its outer scope.\\n\\n` +
      "```typescript\\nconst add = (x: number) => (y: number) => x + y;\\n```" +
      `","handsOn":[]}`;
    const result = parsePart(json).study;
    expect(result).toContain("## Closures");
    expect(result).toContain("```typescript");
    expect(result).toContain("const add");
  });

  it("handles stream cut off mid-escape-sequence gracefully", () => {
    const partial = `{"study":"some content\\`;
    expect(typeof parsePart(partial).study).toBe("string");
  });
});
