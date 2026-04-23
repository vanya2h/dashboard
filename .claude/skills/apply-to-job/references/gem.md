# Gem ATS — Form Specification

Applies when the application URL is on `jobs.gem.com`.

For all personal data (name, email, phone, links, documents, work authorization answers) read `profile.md` in the repo root.

---

## Form structure

The form is embedded at the bottom of the job description page under **"Ready to apply? — Powered by Gem"**. Scroll down to reach it.

Standard fields (presence may vary per job):

| Field | Required |
|---|---|
| First name | Yes |
| Last name | Yes |
| Email | Yes |
| LinkedIn URL | No |
| Resume | Yes — file upload |
| "Are you currently authorized to work in the United States without the need for employer sponsorship?" | Varies — Yes/No checkboxes |
| "Will you now or in the future require sponsorship for employment visa status in the United States?" | Varies — Yes/No checkboxes |

No cover letter field, no phone, no GitHub on standard Gem forms. **Skip the cover letter step.**

---

## Filling the form

Fill all fields in a single pass (no need for group-by-group confirmation as in the generic flow).

Use the corresponding values from `profile.md` for each field. For the US work authorization checkboxes, use the work authorization answers from `profile.md`.

---

## Custom questions

If the form has additional screening questions beyond the standard set, answer them using context from the lead file and the candidate's background (read `profile/overview.md` if needed). For open-ended motivation questions, follow the humanizer + approval flow from the main skill.

---

## Pre-submit review

Take a screenshot of the completed form and show the user.

Tell them: "Form filled. Please review — reply **submit** to submit, or tell me what to fix."

Do NOT click submit until the user explicitly says "submit" or "go ahead".

---

## After submission

Return to the main skill's Step 5 to mark the lead as applied.
