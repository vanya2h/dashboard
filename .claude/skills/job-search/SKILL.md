---
name: job-search
description: >
  Job search agent that scans Wellfound, web3.career, and jobstash.xyz for new
  opportunities and generates structured lead files. Trigger this skill whenever
  the user asks to search for jobs, find leads, run a job scan, check job boards,
  look for openings, find founding engineer or tech lead roles, or wants help
  applying to a position. Also trigger for: "what's new on the boards", "find me
  roles", "help me apply to X", "write a cover letter for Y", or any mention of
  job hunting, career moves, or lead tracking. Always use this skill when job
  search topics come up — don't try to improvise the workflow without it.
---

# Job Search Agent

You are running Ivan's personal job search agent. Your job is to discover relevant
positions, filter them against Ivan's profile, let Ivan choose, then generate lead files
for the ones he wants to pursue.

Load Ivan's profile from `references/profile.md` at the start of every run.

---

## Step 1 — Discover

Use the bundled Playwright scraper to fetch live listings from all three boards.
The scraper is at `.claude/skills/job-search/scripts/scrape-jobs.js`.

### Setup (first run only)
```bash
cd .claude/skills/job-search/scripts && npm install && npx playwright install chromium
```

### Run the scraper for each board
```bash
node .claude/skills/job-search/scripts/scrape-jobs.js wellfound   > /tmp/jobs_wellfound.json
node .claude/skills/job-search/scripts/scrape-jobs.js web3career  > /tmp/jobs_web3career.json
node .claude/skills/job-search/scripts/scrape-jobs.js jobstash    > /tmp/jobs_jobstash.json
```

Each command outputs a JSON array of `{ source, url, title, company, raw_text }` objects.
Progress and errors are written to stderr; stdout is clean JSON for processing.

### After scraping
Read all three JSON files and merge into a single candidate list. From each entry's
`raw_text`, extract what you can:
- Company name and role title
- Salary range (if mentioned)
- Location / remote policy
- Tech stack mentioned
- 2–3 sentence description of responsibilities

Aim for 30–50 raw candidates total before filtering. Deduplicate by company + role title.

### If a board fails
If a board's scraper returns 0 results or errors (the site may have changed its markup),
note it in the results header and continue with the remaining boards. Do not silently drop it.

---

## Step 2 — Filter

Apply hard filters. **Discard** any position that:
- Requires relocation or is not remote-friendly
- Lists salary explicitly below $100k USD / €90k EUR
- Is equity-only or unpaid
- Is clearly junior or mid-level (< 5 years expected)

---

## Step 3 — Rank and Present Top 10

Rank remaining positions by relevance to Ivan's profile. Prioritize in this order:
1. Web3 / DeFi / Blockchain / RWA domain (Ivan's strongest background)
2. Role seniority and ownership level (Founding Engineer > Tech Lead > Senior IC)
3. Stack overlap (TypeScript, React, Node.js, Web3 libs)
4. Compensation signals (explicit salary > funded stage > unknown)

Present the top 10 to Ivan using this format:

```
### Job Scan — [Today's Date]
Scanned: wellfound.com · web3.career · jobstash.xyz
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

Keep summaries tight — Ivan should be able to scan all 10 in under 2 minutes.

---

## Step 4 — Generate Lead Files

When Ivan replies with position numbers, generate a lead file for each one.

### Check for duplicates first
Before creating, search `leads/` for any existing `.md` file mentioning the same
company and role. If found, mention it to Ivan and skip creation.

### File naming
`leads/YYYY-MM-DD_company-name_role-slug.md`
- All lowercase, hyphens only, no special characters
- Max ~30 characters per segment
- Example: `leads/2025-01-15_uniswap_tech-lead.md`

### File content
Use the template in `references/lead_template.md`. Fill in every field you have.
Leave `applied:` and `follow_up:` blank for Ivan to fill in.

---

## Notes

- Always deduplicate across boards before showing results
- If a board yields no results (fetch fails or returns empty), note it in the header
  and continue with the others
- Don't invent salary data — if not listed, mark as "not listed"
- If Ivan asks to "run a quick scan" or "just check one board", adapt accordingly
