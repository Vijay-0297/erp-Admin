# Nexora ERP — React Frontend

A production-oriented React (Vite) frontend for the Spring Boot + Spring
Security + JWT ERP/inventory backend, built directly against the API
contract extracted from the provided Postman collection
(`Erpcollection.postman_collection.json`).

## Stack

- React 18 + Vite
- React Router v6 (protected/public routes, role-agnostic guard)
- Axios with a centralized client (`src/api/axiosClient.js`) — request/response
  interceptors, automatic JWT bearer attachment, timeout handling, and
  normalized error handling for 400/401/403/404/409/422/500/network/timeout
- Context API for auth state (`src/context/AuthContext.jsx`)
- Tailwind CSS for styling
- `react-hot-toast` for success/error notifications

## Getting started

```bash
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if your backend isn't on :8080
npm run dev
```

The app expects the backend at `VITE_API_BASE_URL` (default
`http://localhost:8080/api`). Update `.env` for other environments —
never hardcode the URL elsewhere in the app.

## Architecture

```
src/
├── api/            One file per resource (axios calls only, no UI/JSX)
├── components/
│   ├── common/     LoadingSpinner, Skeleton, EmptyState, ErrorState,
│   │                ConfirmDialog, PageHeader, Badge
│   ├── layout/     Sidebar, Navbar
│   ├── ui/         Button, Input, Select, Modal (design system primitives)
│   ├── tables/     DataTable (sorting + pagination), Pagination
│   └── forms/      SearchInput
├── context/        AuthContext (login/register/logout, token/user state)
├── hooks/          useAuth, useApi (fetch + loading/error), useMutation
│                    (submitting flag, guards duplicate submits), useDebounce
├── layouts/        AuthLayout (split-screen login/register), MainLayout
│                    (sidebar + navbar + content)
├── routes/         ProtectedRoute, PublicRoute, AppRoutes
├── pages/          One folder per module: dashboard, users, roles,
│                    categories, suppliers, customers, products, purchases,
│                    purchase-items, sales — each with a `*ListPage.jsx`
│                    (search + DataTable) and a `*FormModal.jsx`
│                    (create/edit form with validation)
└── utils/          validators.js, formatters.js, constants.js
```

Data flow for every module follows: `Page → useApi (list) → DataTable`,
and `FormModal → validate() → api/*.js → apiClient → backend`, then
`onSaved()` triggers `refetch()` so the table reflects the change
immediately — no manual state duplication between the list and the form.

## API contract notes (read before wiring against your backend)

The endpoints below were taken exactly as defined in the Postman
collection. A few things worth knowing:

- **Versioning is inconsistent in the backend itself**: every resource is
  under `/api/...` except Roles, which is under `/api/v1/roles`. This is
  preserved as-is in `roleApi.js` rather than "fixed" on the frontend —
  update it there if the backend changes.
- **Endpoints the collection does not define, and this app does not
  fabricate:**
  - `DELETE /users/{id}` — no delete action on the Users page.
  - `DELETE /v1/roles/{id}` — no delete action on the Roles page.
  - `DELETE /purchase-items/{id}` — no delete action on Purchase Items.
  - `GET /sales/{id}`, `PUT /sales/{id}`, `DELETE /sales/{id}` — the Sales
    page only lists and creates; there's no edit/delete UI because the
    backend contract doesn't expose it. Add `salesApi.js` methods and the
    corresponding UI once those routes exist server-side.
- **Login response shape**: the collection doesn't include a sample login
  *response* body, only the request. `AuthContext.login()` defensively
  reads `data.token`, `data.accessToken`, or `data.jwt` — confirm which
  field your backend actually returns and simplify that logic once known.
- **Dashboard metrics** (`src/pages/dashboard/DashboardPage.jsx`) are
  computed client-side from `GET /users`, `/products`, `/customers`,
  `/purchases`, `/sales` (count, sum of `stockQuantity`, low-stock filter
  on `stockQuantity <= minimumStock`) since the collection has no
  dedicated `/dashboard` or `/stats` endpoint. Swap this for a real
  aggregate endpoint if the backend adds one — it'll be cheaper than five
  parallel list calls.

## Error handling

All Axios errors are normalized once, in `axiosClient.js`, into
`{ status, message, errors, isNetworkError, isTimeout }` — pages never
parse `error.response.data` themselves. A 401 clears the stored session
and redirects to `/login` automatically. Messages shown to users never
include raw backend stack traces.

## What's intentionally NOT included

- Role-based UI gating (hiding nav items by role) — the backend contract
  didn't specify a permission matrix per role beyond `roleId` on users, so
  route guarding here is authentication-only (logged in vs not). Add a
  `requiredRole` prop to `ProtectedRoute` once the backend defines what
  each role can access.
- Optimistic UI updates — given several endpoints are missing (delete on
  users/roles/purchase-items, full CRUD on sales), optimistic updates
  would need per-endpoint capability checks that add complexity without
  much payoff at this stage. Every mutation currently refetches the
  source list on success instead.
