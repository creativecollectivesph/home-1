# Job Collectives V11 — Integrated Business OS

One public website, one real account login, and four authorized workspaces in a single GitHub Pages repository. The front end is vanilla HTML/CSS/JavaScript with Supabase Auth/Postgres as its required secure backend.

- `index.html`: public marketing site with careers linked to published HR openings.
- `login.html`: email/password authentication and role-based redirection.
- `management-portal.html`: business operations, tasks, talent hours, client health, support, private messages.
- `talent-portal.html`: assigned tasks, live timeclock, weekly rendered hours, availability, reports, support, profile.
- `client-portal.html`: projects, task review, activity reports, support, profile.
- `hr-portal.html`: people, attendance, recruitment publishing, leave approvals and concerns.
- `js/tjc-core.js`, `js/tjc-app.js`, `js/tjc-login.js`: secure shared application; no browser-local demo data.
- `js/tjc-config.js`: requires the Supabase **publishable** API key, which is not included.
- `supabase/001_job_collectives.sql`: new `jc_`-prefixed database/RLS schema; **review and run on an active project**.

**Begin with [`START_HERE.md`](START_HERE.md).** The existing `tjc-portal` database is inactive, so portal operations are gated until real backend setup is completed.
