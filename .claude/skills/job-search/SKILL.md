---
name: job-search
description: >
  Job search agent that scans Wellfound, web3.career, jobstash.xyz, and TheirStack
  for new opportunities and generates structured lead files. Trigger this skill whenever
  the user asks to search for jobs, find leads, run a job scan, check job boards,
  look for openings, find founding engineer or tech lead roles, or wants help
  applying to a position. Also trigger for: "what's new on the boards", "find me
  roles", "help me apply to X", "write a cover letter for Y", or any mention of
  job hunting, career moves, or lead tracking. Always use this skill when job
  search topics come up — don't try to improvise the workflow without it.
---

# Job Search Agent

You are running a personal job search agent. Your job is to discover relevant
positions, filter them against the candidate's profile, let the user choose, then generate lead files
for the ones they want to pursue.

Load the candidate's profile from `profile.md` at the repo root at the start of every run. It points to the `profile/` folder — read the relevant files as needed (target roles, tech stack, preferences).

---

## Step 1 — Choose Data Source

Ask the user which source(s) to use. Present the options clearly:

```
Which data source would you like to scan?

1. wellfound     — Wellfound.com (Playwright scraper)
2. web3career    — web3.career (Playwright scraper)
3. jobstash      — jobstash.xyz (Playwright scraper)
4. theirstack    — TheirStack API (requires THEIRSTACK_API_KEY)
5. all scrapers  — wellfound + web3career + jobstash
6. all           — all scrapers + theirstack

Reply with a number or name.
```

Wait for the user's reply, then proceed to Step 2 with the selected source(s).

If the user says "quick scan", "just check one", or names a board directly in their opening message, skip this prompt and proceed with the source they specified.

---

## Step 2 — Discover

### Setup (first run only)
```bash
cd .claude/skills/job-search/scripts && npm install && npx playwright install chromium
```

All scripts load environment variables automatically from the repo root `.env` via `dotenv-cli`.

### Scrapers — wellfound, web3career, jobstash

Run only the boards the user selected from the scripts directory:

```bash
cd .claude/skills/job-search/scripts
npm run scrape:wellfound  > /tmp/jobs_wellfound.json
npm run scrape:web3career > /tmp/jobs_web3career.json
npm run scrape:jobstash   > /tmp/jobs_jobstash.json
```

Each command outputs a JSON array of `{ source, url, title, company, raw_text }` objects.
Progress and errors are written to stderr; stdout is clean JSON for processing.

### TheirStack API

API key is read from `THEIRSTACK_API_KEY` in the repo root `.env` automatically.

Run the TypeScript fetcher from the scripts directory:
```bash
cd .claude/skills/job-search/scripts
npm run fetch:theirstack > /tmp/jobs_theirstack.json
```

Outputs the same `{ source, url, title, company, raw_text }` format.

### After fetching

Read all selected JSON files and merge into a single candidate list. From each entry's
`raw_text`, extract what you can:
- Company name and role title
- Salary range (if mentioned)
- Location / remote policy
- Tech stack mentioned
- 2–3 sentence description of responsibilities

Aim for 30–50 raw candidates total before filtering. Deduplicate by company + role title.

### If a source fails
Note it in the results header and continue with the remaining sources. Do not silently drop it.

---

## Step 3 — Filter

Apply hard filters. **Discard** any position that:
- Requires relocation or is not remote-friendly
- Lists salary explicitly below $100k USD / €90k EUR
- Is equity-only or unpaid
- Is clearly junior or mid-level (< 5 years expected)

---

## Step 4 — Rank and Present Top 10

Rank remaining positions by relevance to the candidate's profile (read `profile/target_roles.md` and `profile/tech_stack.md`). Prioritize in this order:
1. Web3 / DeFi / Blockchain / RWA domain
2. Role seniority and ownership level (Founding Engineer > Tech Lead > Senior IC)
3. Stack overlap (TypeScript, React, Node.js, Web3 libs)
4. Compensation signals (explicit salary > funded stage > unknown)

Present the top 10 using this format:

```
### Job Scan — [Today's Date]
Scanned: [selected sources]
Raw candidates: X | After filtering: X | Showing top 10

────────────────────────────────────────
#1
Company Name · Role Title
Remote · 💰 $120k–$180k · Web3/DeFi
🔗 URL

One to two sentence summary of the role and why it's a strong fit.
────────────────────────────────────────
#2
...
────────────────────────────────────────

Reply with the numbers you want to pursue (e.g. "1 3 7") and I'll generate lead files for each.
```

Keep summaries tight — the user should be able to scan all 10 in under 2 minutes.

---

## Step 5 — Generate Lead Files

When the user replies with position numbers, generate a lead file for each one.

### Check for duplicates first
Before creating, search `leads/` for any existing `.md` file mentioning the same
company and role. If found, mention it to the user and skip creation.

### File naming
`leads/YYYY-MM-DD_company-name_role-slug.md`
- All lowercase, hyphens only, no special characters
- Max ~30 characters per segment
- Example: `leads/2025-01-15_uniswap_tech-lead.md`

### File content
Use the template in `references/lead_template.md`. Fill in every field you have.
Leave `applied:` and `follow_up:` blank.

---

## Notes

- Always deduplicate across sources before showing results
- If a source yields no results (fetch fails or returns empty), note it in the header
  and continue with the others
- Don't invent salary data — if not listed, mark as "not listed"
- If the user asks to "run a quick scan" or "just check one board", adapt accordingly
