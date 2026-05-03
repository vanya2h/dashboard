import { parseCurriculumDef } from "../src/data/types";
import { db } from "../src/server/db";

const rows = await db.customCurriculum.findMany({
  select: { id: true, name: true, coverImage: true, phases: true, skills: true, description: true },
});

console.log("Raw DB rows:");
for (const row of rows) {
  console.log({ id: row.id, name: row.name, coverImage: row.coverImage?.slice(0, 60) });
}

console.log("\nAfter parseCurriculumDef:");
for (const row of rows) {
  const parsed = parseCurriculumDef({
    ...row,
    description: row.description ?? undefined,
    coverImage: row.coverImage ?? undefined,
  });
  console.log({ id: row.id, name: row.name, parsedOk: !!parsed, coverImage: parsed?.coverImage?.slice(0, 60) });
}

await db.$disconnect();
