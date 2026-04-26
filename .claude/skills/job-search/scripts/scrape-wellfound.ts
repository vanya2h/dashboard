#!/usr/bin/env node
/**
 * scrape-wellfound.ts — Playwright scraper for wellfound.com
 *
 * Usage:  npx tsx scrape-wellfound.ts > /tmp/jobs_wellfound.json
 */

import { chromium } from 'playwright';
import type { Page } from 'playwright';
import { loadPage, dedup, DEFAULT_USER_AGENT, type StandardJob } from './lib/scraper.js';

const URLS = [
  'https://wellfound.com/jobs?query=web3+typescript+senior&remote=true',
  'https://wellfound.com/jobs?query=defi+founding+engineer&remote=true',
  'https://wellfound.com/jobs?query=blockchain+tech+lead&remote=true',
];

async function extract(page: Page): Promise<StandardJob[]> {
  return page.evaluate(() => {
    const results: Array<{ source: string; url: string; title: string; company: string; raw_text: string }> = [];

    const cards = [
      ...document.querySelectorAll('[data-test*="StartupResult"]'),
      ...document.querySelectorAll('[class*="JobListing"]'),
      ...document.querySelectorAll('[class*="job-listing"]'),
    ];

    if (cards.length > 0) {
      cards.forEach((card) => {
        const link =
          (card.querySelector('a[href*="/jobs/"]') as HTMLAnchorElement | null) ||
          (card.querySelector('a') as HTMLAnchorElement | null);
        results.push({
          source: 'wellfound.com',
          url: link ? new URL(link.getAttribute('href') || '', 'https://wellfound.com').href : '',
          title: (card.querySelector('h2,h3,[class*="title"]') as HTMLElement | null)?.innerText.trim() || '',
          company: (card.querySelector('[class*="company"],[class*="startup"]') as HTMLElement | null)?.innerText.trim() || '',
          raw_text: (card as HTMLElement).innerText.slice(0, 1000).trim(),
        });
      });
    } else {
      (document.querySelectorAll('a[href*="/jobs/"]') as NodeListOf<HTMLAnchorElement>).forEach((a) => {
        const container =
          (a.closest('[class*="item"],[class*="card"],li,article') as HTMLElement | null) ||
          (a.parentElement?.parentElement as HTMLElement | null);
        if (!container || container.innerText.length < 30) return;
        results.push({
          source: 'wellfound.com',
          url: new URL(a.getAttribute('href') || '', 'https://wellfound.com').href,
          title: a.innerText.trim(),
          company: '',
          raw_text: container.innerText.slice(0, 1000).trim(),
        });
      });
    }

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
