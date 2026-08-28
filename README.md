# Attendance Care

A simple full-stack attendance and leave management application built with the MERN stack. Employees can clock in/out and request leave; admins can manage employees, correct attendance, and approve/reject leave requests.

This is a portfolio project built to demonstrate practical full-stack skills (React, Next.js, TypeScript, Node.js, Express, MongoDB, REST APIs, auth, Docker) without unnecessary enterprise complexity.

## Features

**Admin**
- Dashboard with team stats (present/absent today, on leave, hours this month)
- Manage employees (add, edit, deactivate)
- View and filter all attendance records, manually correct entries
- Export attendance as CSV
- Approve or reject leave requests

**Employee**
- Personal dashboard with today's status and monthly hours
- Clock in / clock out
- View attendance history
- Request leave and track request status
- Edit basic profile info

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS — no UI component libraries, all components are custom-built
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB with Mongoose
- **Auth:** JWT stored in an HTTP-only cookie, bcrypt password hashing
- **Testing:** Jest + Supertest (backend) with an in-memory MongoDB instance
- **Infra:** Docker + Docker Compose

## Architecture

The client and server are two separate applications that communicate over a REST API. The client never talks to MongoDB directly. Authentication uses a JWT signed by the server and stored in an HTTP-only cookie, so the browser never has direct access to the token.

```
Browser  --REST/JSON-->  Express API  --Mongoose-->  MongoDB
  ^                          |
  |___ httpOnly cookie (JWT) _|
```

## Folder Structure

```
attendance-care/
├── client/                 Next.js app (App Router)
│   ├── app/                 Routes: /login, /dashboard, /employees, /attendance, /leaves, /profile
│   ├── components/          Reusable UI + feature components (Button, Table, Sidebar, ...)
│   ├── hooks/                useAuth (auth context)
│   ├── lib/                  API client, formatting helpers
│   └── types/                 Shared TypeScript types
│
├── server/                 Express API
│   ├── src/controllers/      Route handlers
│   ├── src/middleware/       auth, admin authorization, error handler
│   ├── src/models/           User, Attendance, LeaveRequest, WorkSchedule
│   ├── src/routes/           Express routers
│   ├── src/services/         Small business logic helpers (e.g. hour calculation)
│   ├── src/utils/            JWT, CSV, DB connection, seed script
│   └── src/tests/            Jest + Supertest tests
│
├── docker-compose.yml
└── README.md
```

## Getting Started

### Option 1: Docker (recommended)

Requires Docker installed. From the project root:

```bash
docker compose up --build
```

This starts MongoDB, the Express API, and the Next.js client together. Once it's up:

- Client: http://localhost:3000
- API: http://localhost:5000/api

Seed the database with demo data (admin, employees, attendance, leave requests):

```bash
docker compose exec server npm run seed
```

> **Port conflicts:** on macOS, port 5000 is sometimes taken by AirPlay Receiver. If `docker compose up` fails to bind a port, run it with a different host port, e.g. `SERVER_PORT=5001 docker compose up --build` (the client automatically points at the new port).

### Option 2: Run locally without Docker

Requires Node.js 20+ and a local or remote MongoDB instance.

**Server**
```bash
cd server
cp .env.example .env   # adjust MONGODB_URI / JWT_SECRET if needed
npm install
npm run seed            # optional: populates demo data
npm run dev              # runs on http://localhost:5000
```

**Client**
```bash
cd client
cp .env.example .env
npm install
npm run dev              # runs on http://localhost:3000
```

## Environment Variables

**server/.env**
| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `CLIENT_URL` | URL of the frontend, used for CORS |
| `NODE_ENV` | `development` or `production` |

**client/.env**
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the API, e.g. `http://localhost:5000/api` |

## Database & Seed Data

Running `npm run seed` (or `docker compose exec server npm run seed`) wipes and repopulates the database with:

- 1 admin account
- 4 employee accounts with work schedules
- ~10 days of realistic attendance history per employee
- A handful of pending/approved/rejected leave requests

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@attendancecare.com` | `Admin123!` |
| Employee | `sarah.johnson@attendancecare.com` | `Employee123!` |
| Employee | `michael.chen@attendancecare.com` | `Employee123!` |
| Employee | `emily.davis@attendancecare.com` | `Employee123!` |
| Employee | `james.wilson@attendancecare.com` | `Employee123!` |

These credentials only exist in the seed script — they are never hardcoded in the application logic.

## API Overview

All routes are prefixed with `/api`.

| Method | Route | Description | Access |
|---|---|---|---|
| POST | `/auth/login` | Log in, sets an HTTP-only cookie | Public |
| POST | `/auth/logout` | Clear the auth cookie | Public |
| GET | `/auth/me` | Get the current user | Authenticated |
| PATCH | `/auth/me` | Update own name/email | Authenticated |
| GET | `/employees` | List employees | Admin |
| GET | `/employees/:id` | Get one employee | Admin |
| POST | `/employees` | Create employee | Admin |
| PATCH | `/employees/:id` | Update employee | Admin |
| DELETE | `/employees/:id` | Deactivate employee | Admin |
| GET | `/attendance` | List attendance (own records for employees, filterable for admin) | Authenticated |
| GET | `/attendance/export` | Export attendance as CSV | Admin |
| POST | `/attendance/clock-in` | Clock in for today | Authenticated |
| POST | `/attendance/clock-out` | Clock out for today | Authenticated |
| PATCH | `/attendance/:id` | Correct an attendance record | Admin |
| GET | `/leaves` | List leave requests (own for employees, all for admin) | Authenticated |
| POST | `/leaves` | Create a leave request | Authenticated |
| PATCH | `/leaves/:id` | Approve/reject a leave request | Admin |
| GET | `/schedules/:employeeId` | Get a work schedule | Authenticated (own, or admin) |
| PATCH | `/schedules/:employeeId` | Update a work schedule | Admin |
| GET | `/dashboard/admin` | Admin dashboard stats | Admin |
| GET | `/dashboard/employee` | Employee dashboard stats | Authenticated |

## Testing

Backend tests use Jest + Supertest against an in-memory MongoDB instance (no external database needed to run them).

```bash
cd server
npm test
```

Covers: login, auth/authorization middleware, clock-in/clock-out, duplicate clock-in prevention, leave request creation and date validation, and admin-only route protection.

## Future Improvements

- Pagination for large attendance/employee lists
- Email notifications on leave approval/rejection
- Configurable per-employee work schedules reflected in attendance validation
- Refresh tokens instead of a single long-lived JWT
