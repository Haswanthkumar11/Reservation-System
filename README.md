# The Reservation Table

A full-stack restaurant reservation system (single restaurant) with automatic table
allocation, conflict-free booking, and role-based access control.

Stack: **React (Vite)** · **Node.js + Express** · **MongoDB (Mongoose)** · **JWT auth**

---

## 1. Architecture

Layered backend, so business logic never lives in controllers:

```
Routes → Controllers → Services → Repositories → Mongoose Models → MongoDB
```

- **Routes** — wire URLs to controllers, apply `authMiddleware` / `roleMiddleware`.
- **Controllers** — thin. Parse `req`, call a service, shape the response. No logic.
- **Services** — all business rules live here (table allocation algorithm, conflict
  detection, validation, RBAC decisions beyond route-level role checks).
- **Repositories** — the only layer that talks to Mongoose/MongoDB. Keeps services
  storage-agnostic and easy to unit test.
- **Models** — Mongoose schemas for `User`, `Table`, `Reservation`.

```
backend/src
  config/db.js            Mongo connection
  models/                 User, Table, Reservation schemas
  repositories/            DB access only
  services/                Business logic (allocation, conflict check, RBAC rules)
  controllers/              Thin request/response layer
  middlewares/              JWT auth, role guard, centralized error handler
  routes/                    auth, tables, reservations, admin
  seed/seedTables.js        Seeds 4 default tables
  app.js / server.js
```

Frontend mirrors the same separation of concerns: `services/` (API calls) →
`context/` (auth state) → `pages/` (screens) → `components/` (shared UI).

---

## 2. Reservation logic (the core of the assignment)

**Smallest-suitable-table allocation**, run inside a MongoDB transaction so
concurrent bookings can't double-assign a table:

1. Find all active tables with `capacity >= guestCount`, sorted **smallest capacity
   first**.
2. Walk that list in order; for each candidate table, check whether a **confirmed**
   reservation already exists for the same `table + reservationDate + timeSlot`.
3. Assign the **first table with no conflict**. A 6-seat party is never put at an
   empty 10-seat table if a 6-seat table is free.
4. If every suitable table is booked at that slot → `409 No tables available`.
   If no table exists with enough capacity at all → `404`.

This whole "check conflicts → save" sequence runs inside a `mongoose` session /
transaction (`services/reservationService.js`), which is what actually prevents a
race condition where two people book the last available table at the same
millisecond — a plain "find then save" without a transaction can double-book under
load.

## 3. RBAC

| Action | Customer | Admin |
|---|---|---|
| Register / Login | ✅ | ✅ |
| Create reservation | ✅ | ❌ (admins don't book on behalf of customers in this version) |
| View own reservations | ✅ | — |
| Cancel own reservation | ✅ | — |
| View all reservations | ❌ | ✅ |
| Filter reservations by date | ❌ | ✅ |
| Update / cancel any reservation | ❌ | ✅ |
| Manage tables (CRUD) | ❌ | ✅ |

Enforced via `authMiddleware` (verifies JWT, attaches `req.user`) and
`roleMiddleware('admin' | 'customer')` on each route. Ownership checks (a customer
can only cancel *their own* reservation) happen in `reservationService`.

## 4. API summary

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile          (auth)

GET    /api/tables                (auth)
POST   /api/tables                (admin)
PATCH  /api/tables/:id            (admin)
DELETE /api/tables/:id            (admin)

POST   /api/reservations          (customer)
GET    /api/reservations/my       (customer)
DELETE /api/reservations/:id      (customer, own only)

GET    /api/admin/reservations         (admin)
GET    /api/admin/reservations/date?date=YYYY-MM-DD  (admin)
PATCH  /api/admin/reservations/:id     (admin)
DELETE /api/admin/reservations/:id     (admin)

GET    /api/settings                   (any authenticated user — opening/closing time, slot duration)
GET    /api/settings/slots             (any authenticated user — dynamically generated HH:mm slot list)
PATCH  /api/settings                   (admin — update opening/closing time or slot duration)

GET    /api/reservations/preview       (customer — dry-run of the allocation algorithm, no reservation created)

GET    /api/notifications              (any authenticated user — own notifications, newest first)
PATCH  /api/notifications/:id/read     (any authenticated user)
PATCH  /api/notifications/read-all     (any authenticated user)
```

`GET /api/admin/reservations` and `/api/admin/reservations/date` also accept
optional `status`, `timeSlot`, and `search` query params — `search` matches
against customer name/email, table number, date, time, status, or reservation
ID.

Standard error codes: `401` unauthenticated, `403` wrong role/ownership, `404` not
found, `409` conflict (double booking, duplicate email), `422` invalid input, `500`
unexpected.

## 5. Assumptions

- Single restaurant, no multi-tenant/branch support (per the assignment).
- `reservationDate` is stored as `YYYY-MM-DD` and `timeSlot` as `HH:mm` (24h) — no
  duration/end-time modeling; a slot is a single point in time per table.
- Public `/auth/register` always creates a `customer`. Admin accounts are created by
  seeding/editing the DB directly (there's no self-service "become admin").
- A reservation cannot be made in the past.

## 6. Frontend UI

The frontend was redesigned as a SaaS-style dashboard: a collapsible sidebar +
top bar shell for authenticated pages (Admin/Customer dashboards, reservations,
tables), with tables re-flowing into cards below 700px so nothing requires
horizontal scrolling. Breakpoints: desktop (4-col KPI grid, side-by-side
charts) → laptop/tablet (2-col KPI grid, stacked charts, sidebar becomes an
off-canvas drawer) → mobile (1-col cards, full-width buttons, hamburger menu).

**Dashboard analytics are demonstration data.** The Admin Dashboard's
"Reservation Trend" line chart is an illustrative UI value (labeled "Demo
data" in the interface) meant to showcase dashboard layout, not live
analytics. KPI counts (Total/Today's Reservations, Available Tables,
Occupancy Rate), the Status Distribution chart, and the Customer Dashboard's
Upcoming/Past/Cancelled counts and Favorite Time Slot *are* computed from real
reservation/table data returned by the existing API. Table Status chips
(Available/Reserved/Cleaning) are also live except "Cleaning", which has no
backing state in the data model and is shown only as a demo state for an
inactive table.

**Restaurant Settings & dynamic slots.** Opening time, closing time, and slot
duration are configurable per-restaurant (`/api/settings`, admin-editable from
the Tables page). The booking dropdown on Quick Book calls
`/api/settings/slots` to generate valid HH:mm options — change the hours once
and every booking screen picks it up with no code changes.

**Booking flow.** Quick Book is a 4-step wizard (Date → Time → Guests →
Confirm) that calls a new read-only `/api/reservations/preview` endpoint —
a dry run of the existing smallest-suitable-table allocation algorithm — so
the customer sees which table would be assigned before committing.

**Filtering & search.** Reservation History (customer) supports client-side
filters by date, table, and status. Admin Reservation Management adds a
context-aware search (customer name, email, table number, date, time, status,
or reservation ID) plus date/time-slot/status filters, all handled server-side
in `reservationService`.

**Notifications.** Real notification center (not placeholder), backed by a
`notifications` MongoDB collection. Customers are notified on reservation
created/cancelled/updated; admins are notified on every new or cancelled
booking. The bell icon in the top bar shows unread count and lets you mark
notifications as read.

## 7. Local setup

**Backend**
```bash
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed               # creates 4 default tables (T1..T4)
npm run dev                 # http://localhost:5000
```

**Frontend**
```bash
cd frontend
cp .env.example .env       # VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:5173
```

## 8. Deployment

- **Frontend → Vercel**: import the `frontend/` folder as the project root, set
  build command `npm run build`, output dir `dist`, and add env var
  `VITE_API_BASE_URL=https://<your-render-backend>.onrender.com/api`.
- **Backend → Render**: new Web Service pointing at `backend/`, build command
  `npm install`, start command `npm start`, add env vars `MONGO_URI`, `JWT_SECRET`,
  `JWT_EXPIRES_IN`, `CLIENT_ORIGIN=https://<your-vercel-app>.vercel.app`.
- **Database → MongoDB Atlas**: see the step-by-step guide provided separately /
  below.

## 9. Limitations & future improvements

- No email verification or password reset flow.
- No table-hold/expiry (e.g. reserving a slot for 5 minutes during checkout).
- No pagination on admin reservation lists (fine at demo scale, would matter at
  volume).
- No opening-hours or slot-duration configuration — every `timeSlot` is treated as
  a single instant, not a window, so there's no "table is busy for 90 minutes"
  logic. That would be the next real-world addition.
- No automated test suite yet (services are already isolated from Express and
  MongoDB access is behind repositories, which makes them straightforward to unit
  test with Jest + `mongodb-memory-server`).
- No rate limiting on auth endpoints.
