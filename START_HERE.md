# Job Collectives V11 — ONE website + ONE login + FOUR connected portals

**This package replaces the browser-local V10 preview.** It is an authenticated Supabase application. It contains **no seeded clients, VA accounts, or fake activity**, and it does not let users bypass sign-in by choosing a portal.

## Your GitHub upload: one repository

1. **Back up your current GitHub repository and database. Do not delete them first.**
2. Extract this ZIP. Upload the **contents of this folder** (not the folder itself) to the **root** of a single GitHub repository.
3. Enable GitHub Pages for the `main` branch at `/ (root)`. The `index.html` is the public website; `login.html` is the sole account entry point. All portal pages use **relative links**, so the application can live at `/jobcollectives/` or a later custom domain.
4. **The portal will NOT accept live accounts until the database activation steps below are completed.** This is intentional: a browser-only login would be unsafe.

## Required database setup — before inviting users

I found your Supabase project `tjc-portal` (`btungxqqchyhnohtzhgj`), but its status is **INACTIVE**. I did **not** restore, migrate, overwrite, or delete any database.

1. Visit [Supabase Projects](https://supabase.com/dashboard/projects). Open `tjc-portal` and **restore/reactivate it**, if available. If not recoverable, create a new Supabase project. This may have billing consequences; review Supabase's project status and plan first.
2. After backing up its existing data, open **SQL Editor**. Review and run `supabase/001_job_collectives.sql` **once**. New tables/functions use a unique `jc_` prefix to avoid colliding with old portal tables. The migration has **NOT been executed on a live database** or SQL-validated against your project's exact version.
3. Open **Project Settings → API Keys**. Copy the **publishable (`sb_publishable_...`) key** or legacy `anon` key. Paste it into `js/tjc-config.js` as `supabasePublishableKey`. Update `supabaseUrl` only if you chose a new project. **Never use a `service_role`, secret, or private key here.**
4. Open **Authentication → URL Configuration**. Set the site URL and allowed redirect URLs to the actual GitHub Pages origin and app path. Configure the authentication email provider and invite/verification templates.
5. In **Authentication → Users**, invite an initial management account. Copy that user's **Auth UUID** and add a management profile using SQL Editor:

```sql
insert into public.jc_profiles (id, role, full_name, email, job_title)
values ('REPLACE_AUTH_UUID'::uuid, 'management', 'Account owner', 'owner@yourdomain.com', 'Agency Management');
```

Then log in through `login.html`. Use Management to create your first client and tasks. Add HR/Talent/Client accounts by inviting them in **Auth → Users** and inserting their `jc_profiles` records with the appropriate role. **Client accounts additionally require `client_id`**, which must reference their actual `jc_clients.id`:

```sql
insert into public.jc_profiles (id, role, full_name, email, job_title, client_id)
values ('REPLACE_AUTH_UUID'::uuid, 'client', 'Client contact', 'client@example.com', 'Primary contact', 'REPLACE_CLIENT_UUID'::uuid);
```

**Do not include real passwords in SQL, JavaScript or GitHub.** Account recovery and password changes use Supabase Auth.

## How synchronization works

- **Talent → Management/HR:** Clock in/out via server-controlled timestamps; availability (Active / Away / Busy / On break); live elapsed clock; weekly rendered shift hours; assigned tasks; task work logs; accomplishment reports; leave requests.
- **Management → Client/Talent:** Create clients and assign tasks; review/approve submitted work; monitor assignments, recorded hours, client health, and overdue items.
- **Talent / Client → Management:** Private direct messages and tracked support concerns. RLS restricts message visibility to the sender and recipient.
- **HR → Public Website:** Create a vacancy in HR, then click **Publish**. It becomes visible through the public `Join the Collective` section's database query. The website refreshes openings every 60 seconds while open. Unpublishing removes it. **No GitHub commit per vacancy.**
- Data is in one Supabase database, filtered by RLS. Dashboards refresh about every 30 seconds while idle and on manual **Refresh**. This is near-real-time polling, not an instant WebSocket guarantee.

## What the package intentionally does NOT claim to do yet

- The Supabase project is **inactive**, its publishable key could not be retrieved, and the database migration is not installed. Thus **production end-to-end synchronization has not been verified**.
- Admin creation of logins/invitations still happens through **Supabase Dashboard** until a secure server-side invitation function is built.
- Shift duration includes breaks: **availability status is not automatically deducted from paid hours**. Task work logs are self-reported and separate from payroll attendance. Managers should review them.
- Website inquiry uses the existing email-draft flow, not a CRM submission; legal/privacy pages need review and the public contact inbox must be verified.
- Client and employee access requires real RLS security tests in two distinct authenticated accounts before entering confidential data.

## Required real-world acceptance test before accepting clients

1. Management signs in and creates a client and assignment.
2. Talent signs in on **another device**, sees only their assigned task, clocks in, sets availability, logs task work, and submits an accomplishment.
3. Management and HR independently see the attendance record, completed work and available status.
4. Client signs in, sees only their own company's assignments, and approves submitted work.
5. Talent privately messages Management; verify the client cannot see that message.
6. HR creates a new opening, publishes it, visits `/index.html#careers` in a signed-out browser, and sees the opening. Unpublish and verify it disappears.
7. Attempt to access each portal as the wrong account type; the app should redirect to the authorized workspace. Verify database RLS restrictions separately, including crafted API requests.

After verification, publish your site and onboard clients. **Do not remove the older repository or database backups until all seven pass.**
