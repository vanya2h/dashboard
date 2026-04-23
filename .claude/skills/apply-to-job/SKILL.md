---
name: apply-to-job
description: >
  Applies the candidate to a specific job: generates a PDF cover letter via the cv package,
  fills the application form step by step using Playwright MCP, and marks the lead
  as applied. Trigger when the user says "apply to [company]", "submit application
  for [company]", "fill the form for [lead]", or points to a specific lead file and
  wants to apply. Always use this skill — do not improvise the workflow without it.
---

# Apply to Job

Applies the candidate to a specific job end-to-end. All personal data comes from `profile.md` at the repo root — never hardcode names, emails, or any candidate details.

**Token efficiency rules — follow these strictly:**

- Do not re-read files you have already read in this session.
- Keep Playwright MCP interactions minimal: fill → screenshot → confirm → next field group.
- Do not take extra screenshots unless something looks wrong.

---

## Step 0 — Resolve the Lead File

The user will name a company or provide a file path.

- **Path given:** use it directly.
- **Name given:** search `leads/` for `*_[company-slug]_*.md`. If multiple matches, ask which one.

Read the lead file **once**. Extract and hold in memory:

- `company`, `role`, `url` from YAML frontmatter
- Cover letter body from the `## Cover Letter Draft` section (everything between the `---` delimiters, excluding them)
- Current `status`

If `status` is already `applied`, tell the user and ask before continuing.

---

## Step 1 — Open the Application Page

Use Playwright MCP to navigate to the job URL from the lead file.

Take one screenshot. Identify whether there is:

- A direct application form on the page
- An "Apply" button that opens a modal or new page
- A redirect to an ATS (Greenhouse, Lever, Workable, Ashby, etc.)

Click through to the form if needed. Take one more screenshot once the form is visible.

Scan all visible fields and note whether the form has a cover letter upload or cover letter text field.

Tell the user: "Form loaded — [ATS or direct form detected]. Cover letter required: yes/no. Starting to fill."

**ATS routing:** Once you identify the platform, list the files in `.claude/skills/apply-to-job/references/` and check if a matching spec exists (e.g. `gem.md` for `jobs.gem.com`). If one exists, read it — it overrides the generic Steps 3–4 below for that platform. If none exists, continue with the generic steps.

**Personal data:** Read `profile.md` from the repo root — it points to the `profile/` folder. Load `profile/index.md` for form field values (name, email, phone, links, documents, work authorization), and other profile files only when the form requires it (e.g. `profile/overview.md` for motivation answers). Never hardcode these values.

---

## Step 2 — Generate PDF Cover Letter (only if required)

**Skip this step entirely if the form has no cover letter field.**

If the form has a cover letter upload or text field:

Check if `packages/cv/dist/cover-letters/[company-slug].pdf` already exists:

```bash
ls packages/cv/dist/cover-letters/[company-slug].pdf 2>/dev/null && echo "exists"
```

**If it exists:** proceed to Step 3.

**If not:**

Check the lead file for a `## Cover Letter Draft` section. If missing, draft one now based on the job description and the candidate's profile (read `profile/overview.md` and `profile/experience.md`), run it through the **humanizer skill** (`/humanizer`), show the user for approval, then save it to the lead file under `## Cover Letter Draft` between `---` delimiters.

Split the cover letter body into paragraphs: split on double newlines (`\n\n`), strip leading/trailing whitespace from each, remove empty strings.

Build the command — pass paragraphs as a compact JSON array (no extra whitespace):

```bash
cd packages/cv && npx tsx src/generate-cover-letter.tsx \
  --company "[company]" \
  --role "[role]" \
  --paragraphs '[\"paragraph one text\",\"paragraph two text\",\"paragraph three text\"]'
```

Confirm the output file exists after running.

---

## Step 3 — Fill Form, Group by Group

Skip any group or field that doesn't exist on the form.

Fill fields in logical groups using values from `profile/index.md`. After each group: screenshot → show the user what was filled → wait for "ok" or correction before the next group.

**Group 1 — Personal info** (from `profile/index.md`)

First name, Last name, Email, Phone.

**Group 2 — Location / eligibility** (from `profile/index.md`)

Location / City, Work authorization, Require sponsorship.

**Group 3 — Links** (from `profile/index.md`)

LinkedIn, GitHub / Portfolio, Website.

**Group 4 — Documents** (from `profile/index.md`)

| Field                   | Value                                               |
| ----------------------- | --------------------------------------------------- |
| Resume upload           | path from `profile/index.md` Documents section     |
| Cover letter upload     | `packages/cv/dist/cover-letters/[company-slug].pdf` (only if form has this field) |
| Cover letter text field | paste the cover letter body verbatim (only if form has this field) |

If both a cover letter upload and a text field exist, use the upload; skip the text field.
If the form has no cover letter field at all, skip this row entirely.

**Group 5 — Custom / screening questions**

Read each question and answer it using the lead file context and the candidate's background (read `profile/overview.md` if needed). For anything uncertain, ask the user before filling.

For **open-ended motivation questions** — "Why this company?", "Why this role?", "What interests you about us?", "Tell us about yourself", "What are you looking for?" — apply extra care:

1. Draft the answer using the lead file (company description, role details, cover letter) and `profile/overview.md`.
2. Run it through the **humanizer skill** (`/humanizer`) before filling the field. These answers must sound natural and human-written, not AI-generated.
3. Show the user the humanized answer and wait for approval before filling.

This step is not optional — motivation questions are the highest-signal answers in any application and the most likely to be screened for AI-generated writing.

---

## Step 4 — Pre-Submit Review

Take a full-page screenshot of the completed form.

Tell the user: "Form filled. Please review the screenshot. Reply 'submit' to submit, or tell me what to fix."

**Do NOT click submit until the user explicitly says "submit" or "go ahead".**

---

## Step 5 — Mark as Applied

After the user confirms submission:

Edit the lead file frontmatter:

- `status: applied`
- `applied: YYYY-MM-DD` (today's date)

Append to the `## Timeline` section:

```
- YYYY-MM-DD: Applied
```

Tell the user: "Done — [lead file path] marked as applied."

---

## Playwright MCP Setup Note

This skill requires a Playwright MCP server. If tools like `playwright_navigate` or
`browser_navigate` are not available, the MCP server may not be configured.
Common servers: `@playwright/mcp` (official), `@executeautomation/playwright-mcp-server`.
Check `.claude/settings.json` or ask the user to install one before proceeding.
