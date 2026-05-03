import { z } from "zod";

const PhotoSchema = z.object({
  urls: z.object({ regular: z.string() }),
});

export async function fetchCoverImages(count: number): Promise<string[]> {
  if (count <= 0) return [];
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return [];

  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=abstract&orientation=landscape&count=${count}`,
      { headers: { Authorization: `Client-ID ${accessKey}` } },
    );
    if (!response.ok) return [];

    const parsed = z.array(PhotoSchema).safeParse(await response.json());
    if (!parsed.success) return [];

    return parsed.data.map((p) => p.urls.regular);
  } catch {
    return [];
  }
}
