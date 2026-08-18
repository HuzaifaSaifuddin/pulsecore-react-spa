# PulseCore — React SPA port (mentoring project)

## What this repo is

React (Vite) SPA frontend for PulseCore, a multi-tenant Hospital Management System, styled with
Tailwind CSS to match an existing Django + server-rendered app's look and behavior. Full domain
spec lives in `PulseCore_Rails_React_Port_Brief.md` at repo root — **read it in full before
resuming work here**; this file is a condensed index, not a replacement.

This is a **two-repo project**. The Rails API is a sibling repo at `~/Ruby/rails/pulse_core`,
built in lockstep by a separate Claude Code session against the same brief. That repo owns the
API contract (routes/params/response shapes) — **do not guess the contract from the brief alone**;
pull the real surface from that repo's `CLAUDE.md` Progress block (or ask Huzaifa to paste it)
before building any screen that calls the API. As of 2026-08-17 that repo has checkpoints 1-5 and
8 done (domain models, `/api/v1` controllers, Devise cookie-session auth, CORS) — condensed
contract pulled into this file's Progress block below; re-check the sibling repo directly before
trusting it if much time has passed.

## My role (Claude) here

I am acting as a senior React mentor for Huzaifa, not an autonomous builder.

- Huzaifa: Lead SWE, 10+ yrs Ruby on Rails (models/AR, controllers, migrations, deploy). Close to
  zero production React experience — do not assume frontend fundamentals just because he's senior
  in backend/CS generally. Teach React itself from scratch (components, props, state, effects) as
  well as the SPA-specific concerns (routing, client-side auth guards, data fetching).
- Teaching contract — do not violate:
  - True baby steps on React fundamentals — one idea at a time, zero assumed prior React knowledge.
  - Don't cram — split deep topics across turns/sessions.
  - Hands-on: Huzaifa writes code first, I review. Don't hand him code unless he asks.
  - Quiz at every checkpoint, plus surprise questions mid-build.
  - Stay on-topic: React, Vite, and the direct ecosystem of whatever routing/data-fetching/state
    choices get made — no unrelated tangents.
  - At relevant checkpoints, contrast against how the Django/PulseCore sibling solved the same
    problem (server-rendered templates/mixins) — he'll know that side's Rails/Django equivalents
    from the sibling repo's mentoring session.
  - Give a small solo exercise after each concept, then review his solution.
  - Maintain the "React concepts learned" running list below; reprint whenever it grows.
- Curriculum order (gated by checkpoints, do not skip ahead):
  1. Confirm environment (Node version) before any code.
  2. React + Vite fundamentals: components, props, state, effects, the dev server — taught from
     zero. Set up Tailwind directly in the build (Vite + `@tailwindcss/vite` or PostCSS) to match
     brief §7's palette from the start.
  3. Routing + "no chrome without a session" client-side route guards, plus the "current facility"
     gate from brief §5 (redirect to a "choose your facility" step with a `?next=`-style
     round-trip when unset) — contrast against the Django sibling's server-rendered mixins.
  4. Calling the API: confirm the real contract against the sibling repo's CLAUDE.md first. Build
     one shared API client + error-parsing utility. Wire up registration/login against Devise.
  5. Auth state: where the credential lives, how it's attached to requests, logout/expiry
     handling, `current_facility` + switchable facility list globally (context provider populated
     at app boot) per brief §5.
  6. Domain screens per brief §7: patient search/create, two-step appointment/admission booking
     flow (patient search → form, facility always fixed to Current Facility, never a form field),
     appointment/admission list+detail split-pane (URL-driven selected item / status filter /
     date, `history.replaceState` for pane switches vs. real navigation for filter changes) — call
     out this is the SPA's default shape, not the deliberate exception it was in Django.
  7. Shared component set from brief §7: top nav with facility switcher, flash/toast stack, status
     tabs, date navigator — matching exact palette/spacing so the two apps are visually
     interchangeable.
  8. Testing: Vitest + React Testing Library. Component tests for the shared UI kit (nav, flash,
     status tabs); integration-style tests for the two-step booking flow and auth/route-guard
     behavior (redirect when no session / no current facility).
  9. Deployment.

## Switch signal

Once routing + auth integration (checkpoints 3–5) are working end-to-end against the real Rails API, tell Huzaifa it's time to switch back to the Rails API repo (`~/Ruby/rails/pulse_core`) for the ActiveAdmin/OmniAuth checkpoints, then return here for domain screens (checkpoint 6) once those land.

## Non-goals (brief §3)

Do not build: EMR, Billing, Pharmacy, Laboratory, Radiology, Inventory, full Inpatient (ward/bed),
Insurance, Staff Scheduling, a generic workflow/state-machine engine, a full roles/permissions gem.
These are backend/domain non-goals inherited from the brief — relevant here mainly as "don't build
screens for these."

## Key domain rules not to let drift (brief §4, §5, §7) — easy to accidentally simplify away

- **No admin/superuser bypass** on tenant visibility — this is enforced server-side, but the SPA
  must not imply otherwise in the UI (e.g. no "view as any org" affordance).
- `current_facility` (`User#default_facility`) gates all facility-scoped screens (Appointments,
  Admissions); no per-action facility picker inside those modules. Auto-set on login only if
  exactly one accessible facility, else force explicit choice via redirect-with-`?next=`.
- Two-step booking flow is **not** one form: patient search/create screen, then a separate booking
  form with patient pre-selected and facility fixed (never a form field).
- List+detail split-pane: selected item, status filter, and date all reflected in the URL.
  `history.replaceState` for pane switches (row clicks), real navigation for filter/date changes.
- Palette discipline: blue-600 is the *only* accent color; green/red/blue semantic colors only for
  flash/status. Resist introducing other colors.

## React concepts learned (running list — reprint whenever it grows)

- **Components are just functions that return JSX.** JSX (`<h1>...</h1>`) is a value, same idea as
  a function returning a string or number — just a different kind of value (a description of UI).
- **Capitalization is load-bearing, not style.** `<App />` (capitalized) tells React "render my
  component"; `<app />` (lowercase) is treated as a literal, unrecognized HTML tag — React passes
  it through as-is, the component function never runs, and nothing errors. Renders a blank custom
  element with no console warning — an early example of a React failure mode that's silent, not
  loud.
- **`export default` / `import` wires files together** — same job as Ruby constants being
  available across files via `require`, just explicit about the one thing a file hands out.
- **Props are read-only input a component receives** (like partial locals in Rails); interpolating
  `undefined`/`null`/`false` into JSX with `{}` renders as literally nothing (not the string
  `"undefined"` — a deliberate JSX special-case that later enables `{cond && <Thing />}` patterns).
- **State (`useState`) is data a component owns that can change over time**, where changing it
  (via the setter function, never direct reassignment) triggers a re-render. `useState(0)` — the
  argument is only the *initial* value, used on first render only. This is *the* reason `useState`
  exists instead of a plain `let` variable: plain variable reassignment doesn't trigger React to
  update the DOM.
- **Fragments (`<>...</>`)** satisfy JSX's "must return one root value" rule (a consequence of JSX
  compiling to nested function calls, and a JS function only returning one value) without adding a
  real DOM node the way wrapping in `<div>` would — matters later for CSS layout.
- **Effects (`useEffect`) run side effects after render** — code that isn't about producing UI
  (fetching data, timers, `document.title`, subscriptions). No Rails equivalent, since Rails
  re-renders a whole new response per request; effects exist because an SPA page stays alive in
  the browser and has to react to changes after the fact. Dependency array controls when it
  reruns: `[]` = once after first render only, `[count]` = reruns whenever `count` changes,
  omitted entirely = reruns after every render.
- **Client-side routing needs a library — React itself has no concept of URLs.** React only
  answers "given props/state, what's the DOM?"; it doesn't know the browser has an address bar.
  `react-router` (chosen over rolling `history.pushState`/`popstate` by hand) supplies
  `BrowserRouter`/`Routes`/`Route`/`Link`. `Routes` re-evaluates which `Route` matches on every
  render based on the current URL, regardless of *how* the URL got there (`Link` click, back
  button, typed directly) — this is what makes a route guard a real guard, not just UI politeness.
- **Route guards**: a wrapper component that checks a condition and either renders its children or
  renders `<Navigate to="..." replace />` (React Router's *declarative* redirect). `replace`
  matters — it swaps the current history entry instead of pushing a new one, so "back" skips over
  the redirect instead of bouncing right back to it (same underlying browser mechanism —
  `history.replaceState` — as brief §7's pane-switch behavior, different use case).
- **Layout routes + `<Outlet />`** cover a whole group of routes with one guard instead of wrapping
  each individually — a `<Route element={<Layout />}>` with **no `path`** wraps nested `<Route>`
  children; `<Outlet />` inside the layout is "render whichever child route matched, here." Direct
  Rails analogue: `<%= yield %>` in `application.html.erb` — the layout provides the frame (e.g.
  nav), the matched child slots into the one `<Outlet />` spot.
- **A full page reload (typing a URL in the address bar, hitting refresh) is NOT client-side
  navigation** — it's a real browser request that reloads `index.html` from scratch and wipes
  *all* in-memory JS state (every `useState`) back to its initial value. `Link`/`useNavigate`
  navigation never does this; only a real navigation does. This is exactly why real auth state
  can't live in a plain `useState` — a refresh would silently log the user out — it needs to live
  somewhere durable (token in `localStorage`, or a cookie + a `/me` call on boot to rehydrate).
- **The `?next=` redirect-back round-trip** (brief §5's facility gate, and auth generally):
  `useLocation()` reads the current URL (`.pathname`) *before* redirecting away, so the guard can
  stash "where the user was headed" into the redirect target's query string; the destination page
  reads it back with `useSearchParams()` and calls `useNavigate()` (imperative — called inside an
  event handler, not during render) to send the user back to the original destination once the
  gate's condition (login, facility choice) is satisfied. `<Navigate>` (declarative, renders as
  part of JSX output) vs. `useNavigate()` (imperative, called in response to an event like a click)
  is the general rule for which redirect mechanism fits which situation.
- **A layout route can conflate two separate concerns** — gating (should this render at all?) and
  chrome (what shared UI wraps it?) — if written as one component. Splitting them into a pure
  guard route (no UI, just `Outlet` or `<Navigate>`) with a separate nav-rendering shell nested
  inside it lets a route require auth *without* inheriting chrome it shouldn't have (e.g. a
  standalone "choose your facility" step that needs login but not the top nav).

## Progress

**Current checkpoint:** 2 complete (2026-08-17) — React + Vite fundamentals (components, props,
state, effects) and Tailwind CSS wired into the Vite build. Vite scaffolded via
`npm create vite@latest . -- --template react` (plain JavaScript, not TypeScript — deliberate
choice to keep focus on React concepts first), ESLint chosen over oxlint (react-hooks plugin
coverage matters more than lint speed at this project's size). Tailwind v4 installed via
`@tailwindcss/vite` plugin route per brief §7 — `src/index.css` reduced to a single
`@import "tailwindcss";`, demo purple-accent/dark-mode CSS removed. Verified working end-to-end:
`className="text-blue-600 font-bold"` renders correctly.

**Checkpoint 3 complete (2026-08-17)** — routing (`react-router`), client-side auth route guards,
layout routes (`<Outlet />`), and the `?next=` redirect-back round-trip for both login and the
brief §5 current-facility gate. Built and tested end-to-end against **fake** `isLoggedIn`/
`currentFacility` state (plain `useState`, no persistence) in `src/App.jsx` — this is throwaway
scaffolding to be replaced with real auth state at checkpoint 5, not final structure to preserve.
Final route shape settled on: pure `RequireAuth` guard (no chrome) → `AppShell`/nav layout nested
inside it → `RequireFacility` guard nested inside that — gating and chrome-rendering deliberately
kept as separate layout routes rather than one conflated component.

Next up: checkpoint 4 (calling the real API) — **blocked** until the Rails sibling repo's API
surface is confirmed; re-check its `CLAUDE.md` Progress block before starting (it had no Rails app
generated as of 2026-08-15, must re-verify current state).

**Confirmed API contract (pulled 2026-08-17 from sibling repo's CLAUDE.md — that file is the
source of truth, re-pull if anything here seems stale):**

- **Auth mechanism: cookie-session** (Devise `database_authenticatable`), **not JWT** — decided
  2026-08-16. Every `fetch`/XHR from this repo **must** send `credentials: 'include'`, or the
  browser won't send/accept the session cookie cross-origin at all. Sign-in also requires an
  `Accept: application/json` header (`Content-Type` alone isn't enough for Rails to pick the JSON
  response format).
- **CORS**: allowed origin is `SPA_ORIGIN` env var on the Rails side, defaults to
  `http://localhost:5173` (Vite's default dev port) — must match wherever this repo's dev server
  actually runs.
- **Route split**: most resources live under `/api/v1/...`; auth-adjacent routes are at Devise's
  own defaults instead — `POST /users/sign_in`, `DELETE /users/sign_out`, `POST /users/password`
  (request reset), `PATCH /users/password` (consume reset token). Signup is the one exception at
  `POST /api/v1/signup` (atomic Organization+Facility+org_admin creation, the only unauthenticated
  `/api/v1` endpoint).
- **Error shape convention** (consistent across every endpoint): singular `{"error": "<message>"}`
  for auth/permission/not-found failures (401/403/404); plural `{"errors": [...]}` (array of
  strings) for validation failures (422). Different shapes — the API client's error parser needs
  to branch on this.
- **Resources with `/api/v1` CRUD**: `facilities` (org-scoped, org_admin writes), `users`
  (org-scoped, org_admin writes), `patients` (org-scoped, any authenticated org member writes),
  `appointments`/`admissions` (facility-scoped via `current_user.default_facility`/
  `accessible_facilities`, any authenticated org member writes, plus `advance_status`/
  `revert_status`/`cancel`/`uncancel` POST actions per record).
- **Current-facility enforcement is server-side too**: `GET`/`POST /api/v1/appointments` (and
  admissions) return `409 {"error": "No current facility selected"}` if
  `current_user.default_facility_id` is unset — this repo's client-side facility gate (checkpoint
  3) is a UX nicety, not the real boundary; the API enforces it independently.
  `facility_id`/`admission`'s facility is always server-derived from `current_user.default_facility`
  on create, never client-supplied.
- Full per-endpoint request/response bodies (exact JSON keys, every status code) are documented in
  `~/Ruby/rails/pulse_core/CLAUDE.md` under "Actual API surface as built" — read that section
  directly before building the API client/each screen; this summary is deliberately condensed.