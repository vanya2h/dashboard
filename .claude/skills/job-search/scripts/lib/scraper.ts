import type { Page } from 'playwright';

export interface StandardJob {
  source: string;
  url: string;
  title: string;
  company: string;
  raw_text: string;
}

export async function loadPage(page: Page, url: string): Promise<void> {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
  }
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(600);
  }
}

export function dedup(jobs: StandardJob[]): StandardJob[] {
  const seen = new Set<string>();
  return jobs.filter((j) => {
    const key = j.url || j.title;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return (j.raw_text || '').length > 20;
  });
}

export const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';
