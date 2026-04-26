#!/usr/bin/env node
/**
 * scrape-jobstash.ts — Playwright scraper for jobstash.xyz
 *
 * Usage:  npx tsx scrape-jobstash.ts > /tmp/jobs_jobstash.json
 */

import { chromium } from 'playwright';
import type { Page } from 'playwright';
import { loadPage, dedup, DEFAULT_USER_AGENT, type StandardJob } from './lib/scraper.js';

const URLS = [
  'https://jobstash.xyz/jobs',
  'https://jobstash.xyz/t-typescript',
  'https://jobstash.xyz/t-react',
];

async function extract(page: Page): Promise<StandardJob[]> {
  return page.evaluate(() => {
    const NOISE = new Set(['urgently hiring', 'check eligibility', 'jobs for you', 'view details', 'view organization details']);
    const results: Array<{ source: string; url: string; title: string; company: string; raw_text: string }> = [];

    const detailLinks = (Array.from(document.querySelectorAll('a')) as HTMLAnchorElement[]).filter(
      (a) => a.innerText.trim() === 'View Details' && a.href.includes('jobstash.xyz'),
    );

    detailLinks.forEach((link) => {
      let container: HTMLElement | null = link.parentElement;
      for (let i = 0; i < 6; i++) {
        if (!container || container === document.body) break;
        if (container.innerText.split('\n').filter((l: string) => l.trim()).length >= 4) break;
        container = container.parentElement;
      }

      const raw = container ? container.innerText.trim() : '';
      const lines = raw
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 2 && !NOISE.has(l.toLowerCase()));

      const title = lines[0] || '';
      const company = lines[1] ? lines[1].split('·')[0].trim() : '';

      results.push({
        source: 'jobstash.xyz',
        url: link.href,
        title,
        company,
        raw_text: raw.slice(0, 1000),
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
