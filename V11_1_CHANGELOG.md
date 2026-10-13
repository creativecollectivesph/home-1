# V11.1 — Portal Motion + Theme Integration

- Added the **same WebGL contour background** used on the public website to Management HQ, Talent, Client and HR (shared `js/contour-background.js`).
- Added subtle **role-specific ambient gradients**: blue (Management), teal (Talent), gold (Client), violet (HR).
- Kept cards and header opaque for readability. Background is behind content and never intercepts clicks.
- Added the public site's **circular reveal theme animation** to portal light/dark toggles, including dynamic sun/moon icons, stored preference and theme-color update.
- Respects OS **Reduce Motion** preference; stops canvas animation when tab hidden, and supplies a CSS fallback when WebGL is unavailable.
- Preserved existing login, roles, tasks, timeclock, HR job publishing, and security model unchanged.

## Files changed
- `management-portal.html`, `talent-portal.html`, `client-portal.html`, `hr-portal.html` (add canvas and shared assets)
- `login.html` and `js/tjc-login.js` (same animated toggle on unified sign-in)
- `css/tjc-portal-motion.css` (new)
- `js/tjc-core.js` (theme animation and button state)
- `js/tjc-app.js` (button event and initial sync)

## Deployment
Upload the **contents** of this complete folder to the root of the ONE Job Collectives repository (back up current files first). Do not upload only the HTML pages without their new CSS/JS. The public website and login are included unchanged. Refresh browser cache after upload. The Supabase backend still requires activation and configuration, as described in `START_HERE.md`; this update does not make production authentication functional by itself.
