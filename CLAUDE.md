# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The React (Vite) SPA frontend for **PulseCore**, a multi-tenant Hospital Management System
(appointments + admissions only). It talks to a **separate Rails API-only backend** that lives in
its own repo at `~/Ruby/rails/pulse_core`. There is no backend code here.

- `PulseCore_Rails_React_Port_Brief.md` (repo root) is the shared product/domain spec for both
  repos — domain model, multi-tenancy rules, and the Tailwind visual language (§7) the UI must match.
- The Rails repo's own `CLAUDE.md` is the source of truth for the **API contract** (exact routes,
  params, response bodies). Re-check it there before building anything new that calls the API; the
  summary below is condensed and can go stale.

Plain JavaScript, not TypeScript (deliberate). React 19, `react-router` v8, Tailwind CSS v4 via the
`@tailwindcss/vite` plugin (`src/index.css` is just `@import "tailwindcss";`).

## Commands

```bash
npm run dev        # Vite dev server (default http://localhost:5173)
npm run build      # production build to dist/
npm run lint       # eslint . (must stay clean)
npm run preview    # serve the built dist/
npm test           # vitest run — single pass, CI-shaped
npm run test:watch # vitest — interactive watch
```

Run a single test file or name:

```bash
npx vitest run tests/components/DateNavigator.test.jsx
npx vitest run -t "redirects when no current facility"
```

`VITE_API_BASE_URL` overrides the API origin (defaults to `http://localhost:3000`). The Rails side
allows CORS from `SPA_ORIGIN` (defaults `http://localhost:5173`) and needs the dev server to run there.

## API integration

- **Auth is cookie-session (Devise), not JWT.** Every request must send `credentials: 'include'`
  and `Accept: application/json` — both are baked into `src/api/client.js`'s `request()`, so always
  go through that module (`get`/`post`/`patch`/`del`), never a raw `fetch`.
- **Route split:** auth routes are at Devise defaults (`POST /users/sign_in`, `DELETE /users/sign_out`,
  `/users/password`); everything else is under `/api/v1/...`.
- **Two error shapes:** `{"error": "<msg>"}` for 401/403/404, `{"errors": [<msg>, ...]}` for 422
  validation. `request()` normalizes both into one `ApiError` (`.status`, `.errors`).
- **`GET /api/v1/me`** returns `{ user, current_facility, accessible_facilities }` and is the source
  of truth for session state. `AuthContext` calls it on boot and after login.
- **No `GET /:id` (show) endpoint for any domain resource.** `patients`, `appointments`, `admissions`
  are index-only (`?date=` filter on the latter two). A single record's detail comes from the index
  payload the list already fetched, found by id client-side. Edit/detail screens receive the full
  record via router `state` (set by the `<Link>` that navigated there) OR re-derive it by fetching
  the index and finding by id — see `AppointmentForm`'s `resolvePatient`. A hard refresh on an edit
  route loses `state`; the index-fallback is what keeps it working.
- **No `DELETE` for `patients`/`appointments`/`admissions`.** Do not build delete affordances.
  `cancel`/`uncancel` are the only undo primitives (appointments/admissions); patients have none.
- **409 on facility-scoped endpoints** (`appointments`, `admissions`) when the user has no
  `default_facility` — enforced server-side regardless of the client guard.
- Status transitions are `POST /api/v1/{appointments,admissions}/:id/{advance_status,revert_status,cancel,uncancel}`.

## Architecture

**Providers** (`src/main.jsx`): `<BrowserRouter><AuthProvider><ToastProvider><App/>`. Both contexts
mount once at the root and are consumed independently. Each context's **hook is a separate file**
(`context/useAuth.js`, `context/useToast.js`) from its provider — required by the
`react-refresh/only-export-components` lint rule (a file exporting a component can't also export a hook).

**Global 401 handling:** `client.js` is a plain module and can't use hooks, so it holds a callback
set via `setUnauthorizedHandler(...)`. `AuthProvider` registers `clearAuthState` there on mount.
Any `401` from anywhere clears auth state; the route guards then redirect. `client.js` never calls
`navigate()`. `403` is deliberately *not* treated this way (it's a permission failure, not a dead session).

**Routing** (`src/App.jsx` — pure route tree, no logic beyond the `checkingSession` splash):

- `AuthenticatedLayout` — the auth gate + nav chrome. `<Navigate to="/login">` when not logged in.
- `RequireFacility` — wraps facility-scoped routes; redirects to `/choose-facility?next=<path>` when
  `currentFacility` is unset.
- `RequireOrgAdmin` — wraps only the create/edit routes for facilities/accounts; client-side
  courtesy only, the real check is the server's `403`.
- **Org-scoped** (Patients, Facilities, Accounts): outside `RequireFacility`.
  **Facility-scoped** (Appointments, Admissions): inside it.

**`current_facility` is client-only state.** `setCurrentFacility` updates React state; there is no
API endpoint to persist a user's chosen default facility, so a page refresh reverts it to whatever
`/api/v1/me` returns. Known gap.

**List + detail split-pane** (`AppointmentList`, `AdmissionList`): selected id, status filter, and
date all live in URL search params (`?status=&date=&appointment=`). Row clicks use
`setSearchParams(..., { replace: true })` (no history spam); filter/date changes push a normal entry
and drop the selection. The list endpoint only supports `?date=`, so **status-tab filtering happens
client-side** on the already-fetched day. After a status action, only the touched record is spliced
back into local state (`onUpdate`) — the detail panel keeps showing it even if the new status
filters it out of the table.

**Two-step booking** (brief §7): patient search screen → booking form. Patient and facility are
never form fields — the patient is carried from step one (router `state` or `?patient=` id),
facility is always the locked `currentFacility`. Routes: `/{appointments,admissions}/search` →
`/{appointments,admissions}/new`. The form component is shared between create and edit (`isEditing`
derived from a route `:id` param).

**Dates:** use `toLocalDateString` / `toDatetimeLocalString` from `src/utils/date.js` for any
`YYYY-MM-DD` derived from a local `Date`. Never `Date.toISOString().slice(0, 10)` — it converts to
UTC first and shifts the calendar date near day boundaries.

**Palette discipline** (brief §7): `blue-600` is the only accent color. Green/red/blue are used only
for toast/status semantics. Don't introduce other colors.

## Tests

Vitest + React Testing Library. `tests/` mirrors `src/` 1:1 (e.g.
`tests/components/DateNavigator.test.jsx` → `src/components/DateNavigator.jsx`).

`globals: true` is deliberately **off** — every test imports `describe`/`it`/`expect`/`vi` from
`'vitest'` explicitly, so ESLint needs no test-globals config. Consequences handled in
`tests/setup.js`: jest-dom is imported via its `/vitest` subpath, and `afterEach(cleanup)` is
registered explicitly (RTL's auto-cleanup only fires when it detects a Jest global). A
fake-timer-advanced state update needs wrapping in `act(...)`.

Guard-component tests mock `useAuth`/`useToast` wholesale via `vi.mock`; flow tests mock
`../../api/client`. This suite covers the shared UI kit + route guards + the booking hand-off, not
every CRUD screen.
