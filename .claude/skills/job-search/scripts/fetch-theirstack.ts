#!/usr/bin/env node
/**
 * fetch-theirstack.ts — TheirStack API client for Web3 job search
 *
 * Usage:  THEIRSTACK_API_KEY=<key> npx tsx fetch-theirstack.ts
 *
 * Outputs a JSON array of { source, url, title, company, raw_text } to stdout.
 * Progress/errors go to stderr.
 */

import https from 'https';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderBy {
  field: 'date_posted' | 'discovered_at' | 'salary' | 'job_title' | 'company' | 'num_jobs';
  desc: boolean;
}

interface JobSearchFilters {
  limit: number;
  page: number;
  posted_at_gte?: string;
  posted_at_max_age_days?: number;
  remote?: boolean;
  job_title_or?: string[];
  job_title_pattern_or?: string[];
  job_description_contains_or?: string[];
  job_description_pattern_or?: string[];
  job_description_pattern_is_case_insensitive?: boolean;
  job_technology_slug_or?: string[];
  job_seniority_or?: string[];
  employment_statuses_or?: string[];
  job_title_pattern_not?: string[];
  job_description_pattern_not?: string[];
  job_location_pattern_not?: string[];
  order_by?: OrderBy[];
  blur_company_data?: boolean;
  include_total_results?: boolean;
}

interface TheirStackJob {
  id?: number;
  job_title?: string;
  description?: string;
  url?: string;
  company?: string;
  company_domain?: string;
  country_code?: string;
  location?: string;
  date_posted?: string;
  seniority?: string;
  employment_statuses?: string[];
  remote?: boolean;
  salary_string?: string | null;
  min_annual_salary_usd?: number | null;
  max_annual_salary_usd?: number | null;
  technology_slugs?: string[];
}

interface TheirStackResponse {
  data?: TheirStackJob[];
  metadata?: { total_results?: number | null };
}

interface StandardJob {
  source: string;
  url: string;
  title: string;
  company: string;
  raw_text: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

// Pass --count flag to run a free count-only request (zero credits) for filter debugging.
// Usage: npx tsx fetch-theirstack.ts --count
const FREE_COUNT = process.argv.includes('--count');

const API_KEY = process.env.THEIRSTACK_API_KEY;
if (!API_KEY) {
  process.stderr.write('Error: THEIRSTACK_API_KEY env var is not set.\n');
  process.stderr.write('Set it with: export THEIRSTACK_API_KEY=your_key_here\n');
  process.exit(1);
}

const JOB_TITLES = [
  'Founding Engineer',
  'Tech Lead',
  'Engineering Lead',
  'Lead Engineer',
  'Lead Frontend Engineer',
  'Staff Engineer',
  'Staff Frontend Engineer',
  'Principal Engineer',
  'Senior Frontend Engineer',
  'Senior Front-End Engineer',
  'Senior Fullstack Engineer',
  'Senior Full-Stack Engineer',
  'Senior Full Stack Engineer',
  'Senior Web3 Engineer',
  'Senior Software Engineer',
];

const TECH_SLUGS = [
  'typescript',
  'react',
  'next-js',
  'node-js',
  'ethereum',
  'ethers-js',
  'wagmi',
  'viem',
];

// Jobs whose titles explicitly name a language/stack Ivan doesn't use
const EXCLUDED_TITLE_PATTERNS = [
  'Rust',
  '\\.NET',
  'Golang',
  ' Go ',
  'Solidity',
  'Python',
  'Java ',
  'C\\+\\+',
  'Ruby',
  'PHP',
];

// Jobs in domains irrelevant to Ivan regardless of title/stack
const EXCLUDED_DESCRIPTION_PATTERNS = [
  'defense contractor',
  'defence contractor',
  'Department of Defense',
  'DoD',
  'military',
  'drone',
  'unmanned aerial',
  'swarm robot',
  'aircraft',
  'EuroDrone',
];

const DESCRIPTION_KEYWORDS = [
  'DeFi',
  'web3',
  'on-chain',
  'smart contract',
  'Ethereum',
  'EVM',
  'RWA',
  'tokenization',
  'dApp',
  'protocol',
  'wagmi',
  'viem',
  'ethers',
];

// ─── HTTP helper ──────────────────────────────────────────────────────────────

function post(body: JobSearchFilters): Promise<TheirStackResponse> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options: https.RequestOptions = {
      hostname: 'api.theirstack.com',
      path: '/v1/jobs/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Authorization: `Bearer ${API_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk: string) => { data += chunk; });
      res.on('end', () => {
        if ((res.statusCode ?? 0) >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          return;
        }
        try {
          resolve(JSON.parse(data) as TheirStackResponse);
        } catch {
          reject(new Error(`Invalid JSON response: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ─── Transform ────────────────────────────────────────────────────────────────

function buildRawText(job: TheirStackJob): string {
  const salary = (job.min_annual_salary_usd || job.max_annual_salary_usd)
    ? `Salary: $${job.min_annual_salary_usd ?? '?'}–$${job.max_annual_salary_usd ?? '?'} USD`
    : job.salary_string ?? undefined;
  const parts = [
    job.job_title,
    job.company,
    job.location,
    job.country_code,
    job.seniority ? `Seniority: ${job.seniority}` : undefined,
    job.employment_statuses?.length ? `Type: ${job.employment_statuses.join(', ')}` : undefined,
    salary,
    job.date_posted ? `Posted: ${job.date_posted}` : undefined,
    job.description?.slice(0, 700),
  ];
  return parts.filter(Boolean).join('\n').slice(0, 1000);
}

function toStandardFormat(job: TheirStackJob): StandardJob {
  return {
    source: 'theirstack',
    url: job.url ?? '',
    title: job.job_title ?? '',
    company: job.company ?? '',
    raw_text: buildRawText(job),
  };
}

// ─── Fetch page ───────────────────────────────────────────────────────────────

async function fetchPage(filters: JobSearchFilters): Promise<TheirStackJob[]> {
  process.stderr.write(`  Fetching page ${filters.page} (limit ${filters.limit})…\n`);
  const result = await post(filters);
  const jobs = result.data ?? [];
  process.stderr.write(`  → ${jobs.length} listings\n`);
  return jobs;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const baseFilters: JobSearchFilters = {
    limit: FREE_COUNT ? 1 : 25,
    page: 0,
    posted_at_gte: '2026-03-29',
    remote: true,
    job_title_pattern_or: JOB_TITLES,
    job_description_pattern_or: DESCRIPTION_KEYWORDS,
    job_description_pattern_is_case_insensitive: true,
    job_technology_slug_or: TECH_SLUGS,
    job_seniority_or: ['senior', 'staff', 'c_level'],
    job_title_pattern_not: EXCLUDED_TITLE_PATTERNS,
    job_description_pattern_not: EXCLUDED_DESCRIPTION_PATTERNS,
    order_by: [{ field: 'date_posted', desc: true }],
    blur_company_data: FREE_COUNT ? true : undefined,
    include_total_results: true,
  };

  if (FREE_COUNT) {
    process.stderr.write('Free count mode — no credits consumed.\n');
    const result = await post(baseFilters);
    const total = result.metadata?.total_results ?? null;
    process.stderr.write(`Total matching jobs: ${total ?? 'unknown'}\n`);
    process.stdout.write(JSON.stringify({ total_results: total }) + '\n');
    return;
  }

  process.stderr.write('Querying TheirStack API…\n');
  const allJobs: TheirStackJob[] = [];

  const firstPage = await fetchPage(baseFilters);
  allJobs.push(...firstPage);

  if (firstPage.length === baseFilters.limit) {
    const secondPage = await fetchPage({ ...baseFilters, page: 1 });
    allJobs.push(...secondPage);
  }

  const seen = new Set<string>();
  const unique = allJobs.filter((j) => {
    const key = `${j.company ?? ''}|${j.job_title ?? ''}`.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  process.stderr.write(`Total unique: ${unique.length}\n`);
  process.stdout.write(JSON.stringify(unique.map(toStandardFormat), null, 2) + '\n');
}

main().catch((err: Error) => {
  process.stderr.write(`Fatal: ${err.message}\n`);
  process.exit(1);
});
