# Role-based access — developer guide

How to read the signed-in user's role and gate UI (e.g. show an **Admin** button to
admins and an **Assessor** button to assessors), protect routes, and understand where
the *real* enforcement lives.

> **Golden rule:** UI gating is **UX only**. The real security is server-side —
> Postgres **row-level security (RLS)** on every table, plus role checks inside the
> admin/assessor edge functions. Hiding a button never protects data; RLS does. Always
> rely on both: hide the control *and* trust the backend to reject unauthorized calls.

---

## 1. The role model

Every user has a row in `public.profiles` with:

| Column | Values | Meaning |
|---|---|---|
| `role` | `learner` \| `assessor` \| `admin` | What the user can do. New sign-ups default to `learner`. |
| `organization_id` | `uuid` or `null` | Which tenant they belong to. |

Two things combine into four effective roles:

| Effective role | `role` | `organization_id` | Sees |
|---|---|---|---|
| **Learner (candidate)** | `learner` | — | only their own assessments |
| **Assessor** | `assessor` | their org | assessments **assigned to them** (+ their org's) |
| **Organization admin** | `admin` | **set** | **only their own organization's** data/users/assessments |
| **Platform admin** | `admin` | **null** | **all** organizations (the SaaS operator) |

So an admin **with** an `organization_id` is a tenant-scoped admin; an admin with
`organization_id = null` is the platform super-admin.

---

## 2. Reading the current user + role (client)

Everything comes from the auth context at `@/contexts/auth`.

```tsx
import { useAuth, useIsAdmin, useIsAssessor, useIsLearner } from '@/contexts/auth';

function Example() {
  const { user, loading } = useAuth();
  // user: { id, full_name, email, role, organization_id, ... } | null

  const isAdmin = useIsAdmin();        // user?.role === 'admin'
  const isAssessor = useIsAssessor();  // user?.role === 'assessor'
  const isLearner = useIsLearner();    // learner or signed-out

  // platform admin vs organization (tenant) admin:
  const isPlatformAdmin = isAdmin && !user?.organization_id;
  const isOrgAdmin      = isAdmin && !!user?.organization_id;

  if (loading) return null; // role not resolved yet — don't flash gated UI
}
```

- `useAuth()` returns the whole context (`user`, `session`, `loading`, `signIn`,
  `signUp`, `signOut`, `updateProfile`).
- `useIsAdmin()` / `useIsAssessor()` / `useIsLearner()` are thin boolean helpers.
- **Wait for `loading` to be `false`** before deciding what to show, so a token refresh
  doesn't briefly render the wrong buttons.

---

## 3. Role-gated buttons / navigation

Show the **Admin** button only to admins and the **Assessor** button to assessors (an
admin can also open the assessor view). Drop this anywhere — a header, a menu, a
dashboard.

```tsx
import { useAuth, useIsAdmin, useIsAssessor } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function RoleNav() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const isAssessor = useIsAssessor();
  const navigate = useNavigate();

  if (!user) return null; // signed out — show nothing (or a Sign in button)

  return (
    <div className="flex gap-2">
      {/* Assessors AND admins can open the review workspace */}
      {(isAssessor || isAdmin) && (
        <Button variant="outline" onClick={() => navigate('/assessor')}>
          Assessor Panel
        </Button>
      )}

      {/* Only admins get the admin console */}
      {isAdmin && (
        <Button onClick={() => navigate('/admin')}>
          {user.organization_id ? 'Organization Admin' : 'Admin'} Console
        </Button>
      )}
    </div>
  );
}
```

Prefer plain conditional rendering (`{isAdmin && <Button/>}`) — if the condition is
false the element is never in the DOM. Use CSS `hidden` only when you need the element
present but not shown.

### Optional: a tiny gate component

```tsx
import { useAuth } from '@/contexts/auth';
import type { UserRole } from '@/contexts/auth';

export function RoleGate({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading || !user || !roles.includes(user.role)) return null;
  return <>{children}</>;
}

// usage:
// <RoleGate roles={['admin']}><AdminButton /></RoleGate>
// <RoleGate roles={['assessor', 'admin']}><AssessorButton /></RoleGate>
```

---

## 4. Protecting the pages (routes)

Gating a button hides the entrance; gate the **page** too so a typed URL can't reach it.
The app wraps role pages in `ProtectedRoute` (`src/components/auth/ProtectedRoute.tsx`):

```tsx
// src/App.tsx
<Route path="/admin/*" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminPanel />
  </ProtectedRoute>
} />
<Route path="/assessor/*" element={
  <ProtectedRoute allowedRoles={['assessor', 'admin']}>
    <AssessorPanel />
  </ProtectedRoute>
} />
```

`ProtectedRoute` behavior:
- **not signed in** → redirect to `/login` (remembering the intended page).
- **signed in, wrong role** → redirect to the user's own home (`admin` → `/admin`,
  `assessor` → `/assessor`, else `/`).

## 5. Post-login routing

`src/pages/Login.tsx` sends each user to their workspace after sign-in, by role:

```tsx
const from = location.state?.from?.pathname ||
  (user.role === 'admin'    ? '/admin' :
   user.role === 'assessor' ? '/assessor' :
   '/');
return <Navigate to={from} replace />;
```

So a developer usually doesn't need a manual redirect — send people to `/login` and the
app routes them. The role buttons above are for *cross-navigation* once inside the app
(e.g. an admin jumping to the assessor view).

---

## 6. Granting / changing roles

Roles are assigned by an admin, not self-selected. In the app: **Admin → Users → Manage
Users**, backed by the `admin-manager` edge function:

- `set-role` — change a user's `role` (`learner` | `assessor` | `admin`).
- `invite-user` — invite by email and set their role; the new user inherits the
  inviter's `organization_id` (so an org admin's invitees join **their** org).

An **org admin** can only manage users inside their own organization; a **platform
admin** can manage anyone. New sign-ups are always `learner` until promoted.

To make someone an **organization admin**: set `role = 'admin'` **and**
`organization_id = <that org>`. To make a **platform admin**: `role = 'admin'` with
`organization_id = null`.

---

## 7. Where the real enforcement lives (don't skip)

| Layer | Mechanism |
|---|---|
| **Database** | RLS policies on every table. Admins split into `is_platform_admin()` (all rows) vs org-admin (`organization_id = get_current_user_organization()`); assessors gated on `assigned_assessor = auth.uid()` (+ same org). |
| **Edge functions** | `admin-stats`, `admin-manager`, `admin-delete-user`, `admin-api-keys` verify the caller's JWT + role, then scope every query to the caller's org when they have one (service role bypasses RLS, so they enforce scope in code). |
| **UI (this doc)** | Hides controls the user can't use. Convenience only. |

Because of the bottom two layers, a user who forges their way to `/admin` still gets an
empty / access-denied experience — the buttons just keep the UI honest.

---

## Quick reference

| Need | Use |
|---|---|
| Current user + role | `const { user } = useAuth()` → `user.role`, `user.organization_id` |
| Is admin? | `useIsAdmin()` |
| Is assessor? | `useIsAssessor()` |
| Platform vs org admin | `isAdmin && !user.organization_id` vs `isAdmin && !!user.organization_id` |
| Show a button to a role | `{useIsAdmin() && <Button/>}` |
| Protect a page | `<ProtectedRoute allowedRoles={['admin']}>…</ProtectedRoute>` |
| Admin console route | `/admin` (role `admin`) |
| Assessor workspace route | `/assessor` (role `assessor` or `admin`) |
| Sign-in route | `/login` (auto-routes by role) |
