# Visual and functional QA

Updated and checked on October 9, 2026 (Asia/Manila).

- Desktop visual preview reviewed at 1280 × 720 in the in-app browser; the primary request action is visible without scrolling.
- Mobile viewport checked at 390 × 844; no horizontal overflow.
- Original `TJC Logo.png` loaded at its intrinsic 1080 × 1080 resolution
- Interactive role-explorer hero inspected in light and dark mode. Marketing, Operations, Sales, Customer Support, Creative, and Admin controls update the selected role, capability copy, skill tags, and pressed state.
- Branded Philippines-to-North-America collaboration bridge replaced the disconnected stock photograph and was checked at desktop and 390 × 844 mobile sizes.
- Dark-mode workflow-chip contrast was corrected and verified at `rgb(10, 15, 60)` against white.
- Growth receives the visible “Most subscribed” treatment. Foundation and Growth selection states were exercised in-browser; the selected card, status text, and accessible current state update before continuing to the discovery form.
- The former hero, collaboration, and pricing grids plus the section workstream/scanner backgrounds were removed. No obsolete background elements remain in the document.
- The replacement WebGL contour field was verified active at 1280 × 720 and 390 × 844, in light and dark modes. It is fixed behind the page, does not intercept input, and does not create horizontal overflow.
- The contour animation runs at 30fps on desktop and 20fps on coarse-pointer devices, pauses while the tab is hidden, uses a static frame under reduced motion, and falls back to a plain branded background when WebGL 2 is unavailable.
- The contour shader is dependency-free and includes the required MIT notices for BrewedOps `v1.0.0-mit` and the Ashima/Ian McEwan simplex-noise implementation.
- Footer motion control removed as requested; the footer now contains only the brand, tagline, and copyright.
- Existing text-led services, three-phase process, illustrative workspace, pricing, and conversion flow were restored from the working snapshot and inspected in the browser.
- Mobile navigation opens as a full-screen panel and closes after selection.
- The mobile fixed request action is hidden while the hero or form is visible.
- Illustrative Inbox, Pipeline, and Projects workflow controls update the sample workspace and pressed state; checked on desktop and 390 px mobile with no overflow.
- Portfolio-style light/dark control checked in both directions on desktop and at 390 × 844. The circular reveal originates at the control, the accessible label updates, the browser theme color changes, and the saved choice survives reload.
- Theme changes fall back to an immediate switch when View Transitions are unavailable or reduced motion is requested.
- Original form fields and options remain unchanged. The selected plan is appended only to the generated email body.
- Low-budget/low-revenue qualification path tested in the browser; entered data stayed on the page and the state clearly said nothing was sent.
- Qualified path is implemented as a prefilled email draft and requires the visitor to send it.
- Unified `Log In` destination verified on desktop and at 390 × 844 with no horizontal overflow. The final page includes Client Portal / Talent Portal selection, Google and Apple entry points, username/password fields, a password visibility control, remember-device option, and access-help link.
- Changing the selected portal updates the primary sign-in action. Google, Apple, and account sign-in all stop safely with a clear integration notice while production authentication URLs are blank; the account flow clears the entered password and sends or stores nothing.
- Login light and dark modes were visually checked. A grouped-selector contrast leak affecting light-mode portal labels was found during QA, corrected, and rechecked at `rgb(10, 15, 60)`.
- The login page and existing site JavaScript files passed syntax checks.
- HTML parsed successfully and the final stylesheet has balanced rule braces.
- Official logo checksum confirmed unchanged: `3beeb61356eee975a4ec4d3f2458198b50330939159bca4cb1aedb40323fe90d`.
- Browser console checked with no warnings or errors.

The login interface is production-shaped but authentication remains disconnected until approved identity-provider, password-auth, and portal URLs are supplied in `js/auth-config.js`.
