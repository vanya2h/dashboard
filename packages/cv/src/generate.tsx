import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { renderToFile } from "@react-pdf/renderer";
import { CvPdfDocument } from "./Cv";

const outDir = join(process.cwd(), "dist");
mkdirSync(outDir, { recursive: true });

await renderToFile(<CvPdfDocument />, join(outDir, "cv.pdf"));
console.log("✓ Generated dist/cv.pdf");
