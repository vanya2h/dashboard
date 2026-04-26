#!/usr/bin/env node
/**
 * scrape-web3career.ts — Playwright scraper for web3.career
 *
 * Usage:  npx tsx scrape-web3career.ts > /tmp/jobs_web3career.json
 */

import { chromium } from 'playwright';
import type { Page } from 'playwright';
import { loadPage, dedup, DEFAULT_USER_AGENT, type StandardJob } from './lib/scraper.js';

const URLS = [
  'https://web3.career/',
  'https://web3.career/typescript-jobs',
  'https://web3.career/full-stack-jobs',
];

async function extract(page: Page): Promise<StandardJob[]> {
  return page.evaluate(() => {
    const JOB_URL_RE = /web3\.career\/[a-z0-9-]+\/\d+/;
    const seen = new Set<string>();
    const results: Array<{ source: string; url: string; title: string; company: string; raw_text: string }> = [];

    (document.querySelectorAll('a[href]') as NodeListOf<HTMLAnchorElement>)
      .forEach((a) => {
        if (!JOB_URL_RE.test(a.href) || !a.innerText.trim()) return;
        if (seen.has(a.href)) return;
        seen.add(a.href);

        const container =
          (a.closest('tr,li,[class*="row"],[class*="card"],[class*="job"]') as HTMLElement | null) ||
          (a.parentElement?.parentElement as HTMLElement | undefined);

        results.push({
          source: 'web3.career',
          url: a.href,
          title: a.innerText.trim(),
          company: '',
          raw_text: container ? container.innerText.trim().slice(0, 1000) : a.innerText.trim(),
        });
      });

    return results;
  });
}

async function main(): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: DEFAULT_USER_AGENT,
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  const all: StandardJob[] = [];

  for (const url of URLS) {
    try {
      process.stderr.write(`Scraping ${url}\n`);
      await loadPage(page, url);
      const jobs = await extract(page);
      process.stderr.write(`  → ${jobs.length} listings\n`);
      all.push(...jobs);
    } catch (err) {
      process.stderr.write(`  ✗ ${(err as Error).message}\n`);
    }
  }

  await browser.close();
  const unique = dedup(all);
  process.stderr.write(`Total unique: ${unique.length}\n`);
  process.stdout.write(JSON.stringify(unique, null, 2) + '\n');
}

main().catch((err: Error) => {
  process.stderr.write(`Fatal: ${err.message}\n`);
  process.exit(1);
});
