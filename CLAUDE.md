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
- **`async`/`await` and `fetch`**: JS is single-threaded, so I/O must be non-blocking or the whole
  page would freeze; `fetch` returns a Promise, `await` pauses only the enclosing function until it
  resolves. `fetch` does **not** reject its Promise on HTTP error statuses (401/404/500) — only on
  true network failures — so error handling requires explicitly checking `response.ok`/`status`
  yourself; nothing does it for you. An effect's callback can't be `async` itself (must return
  nothing or a cleanup function, never a Promise), so data-fetching effects define an inner async
  function and call it immediately.
- **Context** (`createContext`/`Provider`/`useContext`) solves prop drilling — a value defined once
  high in the tree is readable by any descendant via `useContext`, no matter the nesting depth,
  without every intermediate component forwarding it as a prop. Rails analogue:
  `ActiveSupport::CurrentAttributes` (`Current.user`), scoped to a component tree instead of a
  request. A state change inside the `Provider` re-renders the `Provider`, which re-renders every
  consumer that called `useContext`/a custom wrapper hook around it — automatic propagation, no
  props passed. (Revisit the deeper "why re-renders propagate" mechanism later with a smaller
  example if needed — a full prose trace through the real `AuthContext` didn't land well in one
  shot; the code-typing side of this landed fine, the mechanism explanation needs a lighter touch.)
- **A layout route can conflate two separate concerns** — gating (should this render at all?) and
  chrome (what shared UI wraps it?) — if written as one component. Splitting them into a pure
  guard route (no UI, just `Outlet` or `<Navigate>`) with a separate nav-rendering shell nested
  inside it lets a route require auth *without* inheriting chrome it shouldn't have (e.g. a
  standalone "choose your facility" step that needs login but not the top nav).
- **One object in `useState` scales a form better than one `useState` per field** (checkpoint 6,
  `PatientForm`). State must always be *replaced*, never mutated, so a single `handleChange` needs
  the spread operator (`{ ...formData, [key]: value }`) to copy every untouched field into the new
  object before overwriting just the one that changed. The `[event.target.name]` part is a
  *computed property key* — whatever string is in the input's `name` attribute becomes the object
  key that gets written — which is what lets one handler serve every field instead of one handler
  per field. Every input needs a matching `name` now, since that's the wiring the handler reads.
- **Context/Provider access is purely tree position, and each side decides independently.** Talked
  through with `BrowserRouter`/`AuthProvider` as the real examples, generalized via a hypothetical
  `CurrentUserContext`/`CurrentFacilityContext` split: (1) a `Provider` only needs mounting *once*,
  wherever in the tree its value should reach — root for app-wide state, but that's a choice
  (Provider placement scopes *how far down* a value reaches), not a rule; (2) every component below
  it independently decides which hook(s), if any, to call — nothing about being inside a
  `Provider`'s subtree forces a component to consume it, and two sibling `Provider`s can be
  consumed in any combination (both, one, or neither) by any descendant. A component rendered as a
  *sibling* of a `Provider` (not nested inside it) gets none of this — `useContext` there returns
  `createContext`'s default value (often `null`), and destructuring off that throws; same failure
  mode as a routing hook used outside `<BrowserRouter>` (a router-specific invariant error instead
  of a bare `null`-destructure crash, but the same "no Provider ancestor" root cause). Also covered:
  the *real* (rare, not-yet-needed-here) reason to split one Context into two — unrelated consumers
  re-rendering on every Provider-value change, since React can't tell a consumer only cared about
  one field of the value object; that's a re-render-scoping optimization, not an access-control
  mechanism (Context has no such thing — any descendant that calls the hook sees the whole value).

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

**Checkpoint 4 complete (2026-08-19)** — shared API client + error-parsing utility
(`src/api/client.js`): one `request()` wrapping `fetch`, always sending `credentials: 'include'`
and the `Accept`/`Content-Type` headers, normalizing both documented error shapes (`{"error"}` /
`{"errors"}`) into one `ApiError` class. Real login wired against `POST /users/sign_in`. Caught two
real cross-repo bugs during this checkpoint, both flagged back to the Rails session rather than
worked around client-side: (1) Devise/Warden returns a plain-text failure body instead of JSON
without an explicit `Accept: application/json` header — not just on sign-in, apparently API-wide;
(2) re-`POST`ing `/users/sign_in` with *invalid* credentials while already holding a valid session
cookie appears to return the existing session's user without re-validating the submitted
credentials (Warden likely short-circuits on an already-authenticated session) — not a privilege
escalation, but misleading; flagged, not yet fixed on either side.

**Checkpoint 5 complete (2026-08-20)** — real `AuthProvider`/`useAuth()` context
(`src/context/AuthContext.jsx` + `src/context/useAuth.js`, split into two files to satisfy Vite's
Fast Refresh `react-refresh/only-export-components` rule — a file can only export components for
reliable hot-reload, so the `useAuth` hook lives separately from the `AuthProvider` component).
Calls the real `GET /api/v1/me` on boot (added by the Rails session specifically for this, closing
the gap noted below) and after login; exposes `currentUser`/`currentFacility`/
`accessibleFacilities`/`isLoggedIn` (derived, not stored)/`checkingSession`/`login()`/`logout()`/
`setCurrentFacility`. All six consumers (`App`, `Login`, `AuthenticatedLayout`, `LogoutButton`,
`ChooseFacility`, `RequireFacility`) migrated off prop-drilled `isLoggedIn`/`currentFacility` onto
`useAuth()` directly — `App.jsx` is now pure route structure. `ChooseFacility` renders real
`accessibleFacilities` (`.map()` + `key`) instead of the old two hardcoded fake buttons.
Hit a real `eslint-plugin-react-hooks` false positive (`set-state-in-effect` can't trace `setState`
calls through a separately-named async function called from an effect, even though they happen
after a genuine `await` boundary) — fixed with a scoped, commented `eslint-disable-next-line`
rather than restructuring correct code to satisfy an imperfect static check.
**Known open gap, not yet built**: mid-session expiry handling — only the boot check currently
reacts to "not logged in"; a `401` from any *later* API call (session expired/revoked mid-use)
doesn't yet trigger the same logged-out state. Belongs in `api/client.js` (centralized), not
per-component. Revisit before or during checkpoint 6's real data-mutating screens.

**Switch signal reached (2026-08-20)**: per the "Switch signal" section above, checkpoints 3-5 are
now working end-to-end against the real Rails API (routing, guards, real login/logout, real
`current_facility`/`accessible_facilities` from `/api/v1/me`). Time to tell Huzaifa to switch to
the Rails repo for ActiveAdmin/OmniAuth, then return here for checkpoint 6 (domain screens) once
those land.

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
- **`GET /api/v1/me`** (added 2026-08-19, replaces the checkpoint-4 stopgap that probed
  `GET /api/v1/facilities` for a bare 200-vs-401 signal): the real session-check endpoint brief §5
  asked for. Authenticated: `200`, `{"user": {...same shape as GET /api/v1/users items...},
  "current_facility": {"id", "name", "organization_id"} | null, "accessible_facilities": [...same
  shape as GET /api/v1/facilities items...]}`. Unauthenticated: `401`, `{"error": "<message>"}`.
  Call this on app boot (and after login) instead of the old probe — it's the real source of truth
  for `currentUser`/`currentFacility`/`accessibleFacilities` and belongs in a proper auth context
  provider (checkpoint 5), not ad-hoc `useState` in `App`.
- **Current-facility enforcement is server-side too**: `GET`/`POST /api/v1/appointments` (and
  admissions) return `409 {"error": "No current facility selected"}` if
  `current_user.default_facility_id` is unset — this repo's client-side facility gate (checkpoint
  3) is a UX nicety, not the real boundary; the API enforces it independently.
  `facility_id`/`admission`'s facility is always server-derived from `current_user.default_facility`
  on create, never client-supplied.
- Full per-endpoint request/response bodies (exact JSON keys, every status code) are documented in
  `~/Ruby/rails/pulse_core/CLAUDE.md` under "Actual API surface as built" — read that section
  directly before building the API client/each screen; this summary is deliberately condensed.
- **No per-record `GET :id` (show) endpoint exists for any resource** — `patients`,
  `appointments`, and `admissions` are all index-only (`GET /api/v1/patients`, optionally
  `?date=` for the other two). A single record's detail comes from the same index payload the
  list screen already fetched, found client-side by id — never a separate fetch. This matters for
  routing: an edit/detail screen either receives the full record via router `state` (set by the
  `<Link>` that navigated there) or re-derives it from an already-loaded list in memory: there is
  no URL that alone can rehydrate one record after a hard refresh with no state. Consistent across
  all three resources, not a gap — just how this API was shaped.
- **No `DELETE` endpoint exists for `patients`, `appointments`, or `admissions`** (only
  `DELETE /users/sign_out` exists in the whole API) — a real divergence from the Django reference
  app, which has org_admin-only hard-delete views for all three. The SPA must not build delete
  affordances for these; `cancel`/`uncancel` are the only "undo" primitives the API exposes for
  appointments/admissions, and patients have no undo action at all once created.
- **`patients` is org-scoped, not facility-scoped** — no `current_facility` requirement on any
  patient endpoint (unlike `appointments`/`admissions`, which 409 without one). Patient screens sit
  outside the `RequireFacility` guard in the route tree, at the same level as `/choose-facility`.

## Checkpoint 6 build mode (decided 2026-08-28)

Per Huzaifa's explicit choice when asked: **hybrid**. For domain screens going forward —
- Repetitive, already-learned patterns (plain list/create/edit screens repeating
  `useState`/`useEffect`/`fetch` he's already written multiple times — e.g. Patients) are built
  directly by Claude via Write/Edit, referencing the Django app at
  `~/Python/django/pulse_core` (`templates/base.html` + each app's `templates/<app>/*.html`) for
  exact markup/Tailwind classes/copy to keep the two apps visually interchangeable per brief §7.
- Genuinely new concepts (the two-step booking flow's cross-route patient hand-off, the
  list+detail split-pane's URL-driven selected-item/status-filter/date state,
  `history`-replace-style pane switching) still go through the snippet-by-snippet hands-on process
  from [[feedback_show_examples_new_apis]] — small pieces, explained, typed by hand.
- This does not touch the still-standing rule from that same memory: never invent an unrelated
  parallel example, and never dump a full new-concept file in one block regardless of which bucket
  a screen falls into overall — the split is about *whether Claude or Huzaifa types the file*, not
  about relaxing how new concepts are delivered when it's his turn to type.

**Patients feature done** (list + register/edit form, `src/pages/patients/`): built directly per
the above. `PatientList` fetches `GET /api/v1/patients` once on mount; `PatientForm` is shared
between create (`POST`) and edit (`PATCH`), reading the record to edit from router `state` (set by
`PatientList`'s edit `<Link state={{ patient }}>`) rather than a fetch, since no show endpoint
exists. Supports the brief's `?next=` inline-registration round-trip (create appends
`?patient=<id>` to `next`, matching `PatientCreateView.get_success_url` in the Django reference;
edit returns to `next` bare, matching `PatientUpdateView`) for the two-step booking flow's "create
patient inline, then continue" case, not yet exercised by a caller until Appointments/Admissions
booking is built. No delete affordance (API has none — see contract note above). Routed outside
`RequireFacility` (org-scoped resource). Old placeholder nav pages `About`/`Career` (checkpoint-3
routing exercises, never real screens) removed; nav now links Home/Patients, with
Appointments/Admissions to be added once those routes exist. Lint and `vite build` both clean.

**Appointments feature done end-to-end** (2026-08-29): two-step booking (patient search →
booking form) and the list+detail split-pane, including status actions and notes editing.
**Scope note**: this one was built directly by Claude, not hands-on — Huzaifa asked to build the
whole feature after already using the search+form pattern hands-on for Patients; confirmed via
AskUserQuestion that this meant building the two-step-flow and split-pane pieces too (both
originally earmarked "genuinely new, hands-on" in the build-mode split above), not just the
repetitive parts. Logged in [[feedback_show_examples_new_apis]] as an explicit, asked-for
exception for this one feature — not a standing change to the hybrid split.

Files: `src/pages/appointments/{AppointmentPatientSearch,AppointmentForm,AppointmentList,
AppointmentDetailPanel}.jsx`, plus two new reusable components pulled forward from checkpoint 7
(`src/components/{DateNavigator,StatusTabs}.jsx`, both prop-driven, no state of their own) and
two new utils (`src/utils/date.js` — `toLocalDateString`/`toDatetimeLocalString`, both local-time-
safe, never `toISOString()` for deriving a calendar date/local timestamp; `src/utils/status.js` —
`formatStatus`).

- **URL state**: `AppointmentList` keeps `?status=`, `?date=`, `?appointment=` all in the URL.
  Verified against the real Django templates (not the brief's more general language) that date and
  status changes each *drop* the current `appointment` selection (a different day/tab has no "same"
  row selected) — only a row click preserves status+date while setting `appointment`, via
  `setSearchParams(..., { replace: true })`. Status filtering is a plain client-side `.filter()`
  over the day's already-fetched list — confirmed via the Rails contract that `GET
  /api/v1/appointments` has no `?status=` param, only `?date=`, so there's nothing to refetch on a
  tab switch.
- **Selected detail survives a status change that filters it out of the table** — deliberate,
  matches Django's own comment ("if you just advanced an appointment past the tab you're viewing,
  its detail should stay visible"). Implemented by keeping one `appointments` array (the full,
  unfiltered day) in state and updating the matching entry in place from each mutation's response;
  `selectedAppointment` is derived via `.find()` on that same array, never filtered.
- **Doctor dropdown only scopes to `role === 'doctor'` org-wide**, not to the current facility's
  doctor members like Django's `User.objects.filter(role=DOCTOR, facilities=facility)` — `GET
  /api/v1/users` has no per-user facility-membership data to filter on client-side. Real, flagged
  divergence, not silently matched.
- **Booking-flow patient hand-off**: search screen's "Book" link carries the full patient via
  router `state` (same pattern as `PatientList`'s edit link); `AppointmentForm` falls back to
  fetching the full patients list and finding by id if `state` is missing (e.g. a direct URL visit,
  no search first) — same "index + client derive" shape as everywhere else, and mirrors Django's
  `AppointmentCreateView._resolve_patient` redirecting back to search when no patient resolves.
- **Verified end-to-end in a real browser** against the live Rails API (logged in as a seeded
  org_admin): booking flow, row selection, status advance (`Mark Arrived`) with the row correctly
  dropping out of the Scheduled tab while staying visible in the detail panel, status revert, and
  the server's real "one active appointment per patient per day" conflict rule surfacing correctly
  as a form error. Lint and `vite build` both clean; no console errors during the manual pass.
- **Nav brought fully in line with brief §7**: `AuthenticatedLayout` now renders the brand text as
  the home link (not a separate "Home" item, matching Django exactly), an Appointments link, the
  facility switcher (`<select>` when `accessibleFacilities.length > 1`, else a read-only badge),
  and the logged-in user's email — all previously missing since checkpoint 5 stood the nav up with
  fake placeholder links only.
- **Known gap, not fixed here**: `setCurrentFacility` (used by the new switcher) still only sets
  local React state — there is no `PATCH` endpoint on the Rails side to persist a user's chosen
  `default_facility_id`, so a page refresh silently reverts to whatever's stored server-side. Same
  class of gap as the checkpoint-5 `/me` endpoint before it was built; worth a similar prompt to the
  Rails session if this starts causing real confusion.

**Admissions feature done end-to-end** (2026-08-29), built directly per the now-settled precedent
from Appointments (no re-confirmation asked — see [[feedback_show_examples_new_apis]]'s
2026-08-29 update on not re-asking the same scope question twice in a row for the same class of
work). Structurally a near-clone of Appointments, confirmed against the Django reference's own
`forms.py`/`views.py`/templates before building rather than assumed: `AdmissionPatientSearch`,
`AdmissionForm`, `AdmissionList`, `AdmissionDetailPanel` in `src/pages/admissions/`, reusing
`DateNavigator`/`StatusTabs`/`src/utils/{date,status}.js` as-is. Field names swapped
(`admission_start`/`admission_end` for `scheduled_start`/`scheduled_end`), status set is
`scheduled → arrived → admitted → discharged` (one more rung than Appointment's three-status
chain) with advance-button labels `Mark Arrived` → `Mark Admitted` → `Mark Discharged`. Route
shape mirrors Appointments exactly: `/admissions`, `/admissions/search`, `/admissions/new`,
`/admissions/:id/edit`, all inside `RequireFacility`. Nav gained an `Admissions` link between
Appointments and Patients, matching the Django reference's own link order.

**Verified end-to-end in a real browser** against the live Rails API: booking a new admission for
a patient with a prior *discharged* admission today (confirmed this doesn't false-positive against
the same-day conflict rule, since `discharged` isn't in `ACTIVE_STATUSES`), then walked the full
three-step advance ladder (Mark Arrived → Mark Admitted → Mark Discharged) confirming each button
label changes correctly and the row/detail-panel sync matches Appointments' behavior. Lint and
`vite build` both clean; no console errors.

**Still open for checkpoint 6**: the checkpoint-5 "known open gap" (mid-session 401 expiry
handling in `api/client.js`) — now overdue, both Appointments and Admissions mutate data without
it. Worth doing next, before checkpoint 7's shared-component polish pass or checkpoint 8 (testing).