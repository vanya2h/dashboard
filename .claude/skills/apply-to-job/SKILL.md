---
name: apply-to-job
description: >
  Applies Ivan to a specific job: generates a PDF cover letter via the cv package,
  fills the application form step by step using Playwright MCP, and marks the lead
  as applied. Trigger when the user says "apply to [company]", "submit application
  for [company]", "fill the form for [lead]", or points to a specific lead file and
  wants to apply. Always use this skill — do not improvise the workflow without it.
---

# Apply to Job

Applies Ivan to a specific job end-to-end.

**Token efficiency rules — follow these strictly:**

- Read only the lead file. Do not load profile.md or any other reference file.
- All needed information (cover letter text, URL, company, role) is in the lead file.
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

If `status` is already `applied`, tell Ivan and ask before continuing.

---

## Step 1 — Generate PDF Cover Letter

Check if `packages/cv/dist/cover-letters/[company-slug].pdf` already exists:

```bash
ls packages/cv/dist/cover-letters/[company-slug].pdf 2>/dev/null && echo "exists"
```

**If it exists:** skip to Step 2.

**If not:**

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

## Step 2 — Open the Application Page

Use Playwright MCP to navigate to the job URL from the lead file.

Take one screenshot. Identify whether there is:

- A direct application form on the page
- An "Apply" button that opens a modal or new page
- A redirect to an ATS (Greenhouse, Lever, Workable, Ashby, etc.)

Click through to the form if needed. Take one more screenshot once the form is visible.

Tell Ivan: "Form loaded — [ATS or direct form detected]. Starting to fill."

---

## Step 3 — Fill Form, Group by Group

Fill fields in logical groups. After each group: screenshot → show Ivan what was filled → wait for "ok" or correction before the next group.

**Group 1 — Personal info**

| Field      | Value         |
| ---------- | ------------- |
| First name | Ivan          |
| Last name  | Koriakovtcev  |
| Email      | hi@vanya2h.me |
| Phone      | +351966260417 |

**Group 2 — Location / eligibility**

| Field               | Value                                 |
| ------------------- | ------------------------------------- |
| Location / City     | Lisbon, Portugal                      |
| Work authorization  | Can work in any country from Portugal |
| Require sponsorship | No                                    |

**Group 3 — Links**

| Field              | Value                                     |
| ------------------ | ----------------------------------------- |
| LinkedIn           | https://www.linkedin.com/in/koryakovtsev/ |
| GitHub / Portfolio | https://github.com/vanya2h                |
| Website            | https://vanya2h.me                        |

**Group 4 — Documents**

| Field                   | Value                                               |
| ----------------------- | --------------------------------------------------- |
| Resume upload           | `packages/cv/dist/cv.pdf` (absolute path)           |
| Cover letter upload     | `packages/cv/dist/cover-letters/[company-slug].pdf` |
| Cover letter text field | paste the cover letter body verbatim                |

If both an upload and a text field exist for the cover letter, use the upload; skip the text field.

**Group 5 — Custom / screening questions**

Read each question and answer it using the lead file context and Ivan's background. For anything uncertain, ask Ivan before filling.

For **open-ended motivation questions** — "Why this company?", "Why this role?", "What interests you about us?", "Tell us about yourself", "What are you looking for?" — apply extra care:

1. Draft the answer using the lead file (company description, role details, cover letter).
2. Run it through the **humanizer skill** (`/humanizer`) before filling the field. These answers must sound like Ivan wrote them, not like AI-generated text.
3. Show Ivan the humanized answer and wait for approval before filling.

This step is not optional — motivation questions are the highest-signal answers in any application and the most likely to be screened for AI-generated writing.

---

## Step 4 — Pre-Submit Review

Take a full-page screenshot of the completed form.

Tell Ivan: "Form filled. Please review the screenshot. Reply 'submit' to submit, or tell me what to fix."

**Do NOT click submit until Ivan explicitly says "submit" or "go ahead".**

---

## Step 5 — Mark as Applied

After Ivan confirms submission:

Edit the lead file frontmatter:

- `status: applied`
- `applied: YYYY-MM-DD` (today's date)

Append to the `## Timeline` section:

```
- YYYY-MM-DD: Applied
```

Tell Ivan: "Done — [lead file path] marked as applied."

---

## Playwright MCP Setup Note

This skill requires a Playwright MCP server. If tools like `playwright_navigate` or
`browser_navigate` are not available, the MCP server may not be configured.
Common servers: `@playwright/mcp` (official), `@executeautomation/playwright-mcp-server`.
Check `.claude/settings.json` or ask the user to install one before proceeding.
