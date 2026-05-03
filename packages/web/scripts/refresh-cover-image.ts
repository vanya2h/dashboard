import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const accessKey = process.env.UNSPLASH_ACCESS_KEY;
if (!accessKey) {
  console.error("UNSPLASH_ACCESS_KEY is not set.");
  process.exit(1);
}

const response = await fetch("https://api.unsplash.com/photos/random?query=abstract&orientation=landscape", {
  headers: { Authorization: `Client-ID ${accessKey}` },
});

if (!response.ok) {
  console.error(`Unsplash API error: ${response.status}`);
  process.exit(1);
}

const data = z.object({ urls: z.object({ regular: z.string() }) }).parse(await response.json());
const url = `${data.urls.regular.split("?")[0]}?w=800&q=80`;

const outPath = resolve(import.meta.dirname, "../src/data/cover-image.ts");
writeFileSync(outPath, `export const CUSTOM_CURRICULUM_COVER =\n  "${url}";\n`);

console.log(`Updated cover image:\n  ${url}`);
