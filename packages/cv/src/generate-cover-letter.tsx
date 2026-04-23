import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { renderToFile } from "@react-pdf/renderer";
import { CoverLetterPdf } from "./CoverLetter";

const args = process.argv.slice(2);
const get = (flag: string) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : undefined;
};

const company = get("--company") ?? "";
const role = get("--role") ?? "";
const greeting = get("--greeting");
const paragraphs: string[] = JSON.parse(get("--paragraphs") ?? "[]");
const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, "-");

if (!company || !role || paragraphs.length === 0) {
  console.error(
    'Usage: tsx generate-cover-letter.tsx --company <name> --role <role> --paragraphs \'["p1","p2"]\' [--greeting <text>]',
  );
  process.exit(1);
}

const outDir = join(process.cwd(), "dist", "cover-letters");
mkdirSync(outDir, { recursive: true });

await renderToFile(
  <CoverLetterPdf company={company} role={role} greeting={greeting} paragraphs={paragraphs} />,
  join(outDir, `${slug}.pdf`),
);
console.log(`✓ Generated dist/cover-letters/${slug}.pdf`);
