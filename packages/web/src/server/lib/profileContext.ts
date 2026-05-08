import { db } from "../db";

export type ProfileContext = {
  markdown: string;
};

export async function getProfileContext(userId: string): Promise<ProfileContext | null> {
  const profile = await db.userProfile.findUnique({
    where: { userId },
    select: { markdown: true },
  });
  if (!profile || !profile.markdown.trim()) return null;
  return { markdown: profile.markdown };
}

export function formatProfileForPrompt(profile: ProfileContext): string {
  return `Learner profile (use to calibrate depth, examples, and to skip topics they already know):\n\n${profile.markdown}`;
}

export function appendProfileToSystem(baseSystem: string, profile: ProfileContext | null): string {
  if (!profile) return baseSystem;
  return `${baseSystem}\n\n---\n\n${formatProfileForPrompt(profile)}`;
}
