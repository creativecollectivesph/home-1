# Job Collectives V11 — verification report (2026-10-14)

## Completed in isolated Chromium checks

- All four portal pages render with clean SVG navigation icons and no JavaScript errors in the tested scenarios.
- Talent: clock-in opens a shift, live timeclock appears, availability switches to "On break", and the server-client adapter reloads the updated state.
- Client: can approve a submitted task in the tested flow.
- Management: talent roster and client-health views display linked task information.
- HR: publishing changes the opening status and updates the shared test data.
- Desktop viewport: 1440 × 900. Mobile viewport: 390 × 844. Mobile navigation toggles and closes, dark mode switches, and no document-level horizontal overflow was detected.
- JavaScript syntax checks passed for active entry scripts; all relative script, stylesheet, and asset references resolve inside the ZIP.

## Important scope limitation

These automated interaction checks used an **isolated in-memory test adapter**, NOT fake records in the shipped site. No test data is included in the deployed app. The Supabase project `tjc-portal` is **INACTIVE**; the migration, Auth login, RLS policies, cross-device synchronization and live HR→website publishing **could not be exercised against production**. Review/execute the schema and perform the seven-step acceptance test in `START_HERE.md` before real use.

## Security and operations

- Each page calls the shared Auth service and restricts access by the role in the server-backed profile. The page URL alone doesn't grant access.
- New schema uses unique `jc_` table and RPC names, RLS on sensitive tables, sender/recipient message restrictions, server-issued attendance timestamps, and an anonymous SELECT policy only for published openings.
- Secrets are absent. `js/tjc-config.js` contains the inactive project's public URL with a blank **publishable** key. Do not commit Supabase service/secret keys.
- No demo content, default PINs, or fictional clients are seeded in application code.

## Unverified

- Production Supabase SQL migration syntax on the target project and RLS against real users.
- Email delivery, account invitations, server clock drift and provider availability.
- Website live at actual GitHub Pages after upload.
- Weather API availability on users' networks and production browser.
