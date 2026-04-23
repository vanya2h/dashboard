# Dashboard

Personal execution center for an active job search. Automates lead discovery, application submission, and document generation — all driven by Claude Code skills and a structured candidate profile.

## What it does

1. **Scans job boards** (Wellfound, web3.career, jobstash.xyz) for matching roles
2. **Filters and ranks** candidates against the profile — seniority, stack, salary, remote
3. **Generates lead files** (`leads/`) with job details and a cover letter draft
4. **Applies end-to-end** — fills application forms via browser automation and generates a PDF cover letter
5. **Tracks status** in lead frontmatter (`status: applied`, `applied: 2026-04-22`)

## Structure

```
dashboard/
├── profile/              # Candidate data (read by skills and agents)
│   ├── index.md          # Name, email, phone, links, documents, work auth
│   ├── overview.md       # Summary and core strengths — used in cover letters
│   ├── experience.md     # Full work history
│   ├── target_roles.md   # Target roles, compensation, domain priorities
│   └── tech_stack.md     # Tech stack, engineering focus, hard limits
├── leads/                # One .md file per job lead (auto-generated)
├── packages/
│   └── cv/               # PDF generator for CV and cover letters
└── .claude/skills/       # Claude Code skills (see below)
```

## Skills

Skills live in `.claude/skills/` and are invoked by Claude Code during a session.

| Skill          | What it does                                                                        |
| -------------- | ----------------------------------------------------------------------------------- |
| `job-search`   | Scrapes job boards, filters results, presents top 10, generates lead files          |
| `apply-to-job` | Generates a PDF cover letter, fills the application form, marks the lead as applied |
| `use-profiles` | Loads saved Playwright auth sessions so scraping starts already logged in           |
| `humanizer`    | Removes AI writing patterns from cover letters and motivation answers               |

## Packages

### `@dashboard/cv`

React-PDF-based document generator. Produces a single-page CV and per-company cover letters.

```bash
# Generate CV
cd packages/cv && pnpm generate

# Generate cover letter (used by apply-to-job skill)
pnpm generate:cover-letter --company "Uniswap" --role "Tech Lead" --paragraphs '[...]'
```

Output lands in `packages/cv/dist/`.

## Playwright Profiles

Authenticated browser sessions are stored in `.playwright/profiles/` (gitignored). The profiles config at `.playwright/profiles.json` lists available accounts:

| Profile      | Board        |
| ------------ | ------------ |
| `web3career` | web3.career  |
| `jobstash`   | jobstash.xyz |

## Tooling

- **Runtime:** Node.js, pnpm workspaces
- **Build orchestration:** Turborepo
- **Browser automation:** Playwright MCP

## Typical workflow

```
# 1. Find new roles
/job-search

# 2. Pick leads from the presented list (e.g. "1 3")
# Lead files are created in leads/

# 3. Apply to a specific company
/apply-to-job ambient-finance
```
