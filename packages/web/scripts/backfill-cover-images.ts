import { db } from "../src/server/db";
import { fetchCoverImages } from "../src/server/lib/unsplash";

const curricula = await db.customCurriculum.findMany({
  where: { coverImage: null },
  select: { id: true },
});

if (curricula.length === 0) {
  console.log("Nothing to backfill.");
  process.exit(0);
}

console.log(`Backfilling ${curricula.length} curriculum(s)…`);

const images = await fetchCoverImages(curricula.length);

if (images.length === 0) {
  console.error("No images fetched — check UNSPLASH_ACCESS_KEY.");
  process.exit(1);
}

await Promise.all(
  curricula.map((c, i) =>
    db.customCurriculum.update({
      where: { id: c.id },
      data: { coverImage: images[i % images.length] },
    }),
  ),
);

console.log("Done.");
await db.$disconnect();
