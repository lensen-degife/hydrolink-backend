# HydroLink Backend API

A production-ready REST API for **HydroLink**, a smart water-utility customer
app for Ethiopia. Built with **Node.js + Express + TypeScript + MySQL (Prisma ORM)**.

Covers auth (with OTP), bills, payments, distribution schedules, usage
analytics, leak/service requests, announcements, and push-notification device
registration — everything the Expo/React Native frontend needs to move off
mocked data.

---

## Tech Stack

| Layer          | Choice                                   |
|----------------|-------------------------------------------|
| Runtime        | Node.js                                   |
| Framework      | Express.js                                |
| Language       | TypeScript (strict mode)                  |
| Database       | MySQL 8                                   |
| ORM            | Prisma                                    |
| Auth           | JWT (access + refresh tokens) + bcrypt    |
| Validation     | Zod                                       |
| Security       | helmet, cors, express-rate-limit          |

---

## 1. Prerequisites

- Node.js 18+
- MySQL 8 running locally or remotely
- npm

## 2. Set Up MySQL

Create a database and user (adjust as needed):

```sql
CREATE DATABASE hydrolink CHARACTER SET utf8mb4;
CREATE USER 'hydrolink_user'@'%' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON hydrolink.* TO 'hydrolink_user'@'%';
FLUSH PRIVILEGES;
```

## 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```
DATABASE_URL="mysql://hydrolink_user:strong_password@localhost:3306/hydrolink"
JWT_SECRET="a-long-random-string"
JWT_REFRESH_SECRET="a-different-long-random-string"
```

## 4. Install Dependencies

```bash
npm install
```

## 5. Run Migrations + Seed

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

This creates all tables and seeds:
- 3 sample users (e.g. `abebe.bikila@example.com` / `Password123!`)
- Water bills in ETB across several billing periods
- Telebirr payment history
- Water distribution schedules for multiple Kebeles
- Sample leak/service requests
- Announcements and notifications

## 6. Start the Server

```bash
npm run dev
```

The API will be available at `http://localhost:4000/api/v1`, with a health
check at `http://localhost:4000/health`.

For production:

```bash
npm run build
npm start
```

---

## API Overview

All responses follow this shape:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": { },
  "error": null
}
```

Protected routes expect `Authorization: Bearer <accessToken>`.

| Module         | Base path                  |
|----------------|------------------------------|
| Auth           | `/api/v1/auth`               |
| Users          | `/api/v1/users`               |
| Bills          | `/api/v1/bills`                |
| Payments       | `/api/v1/payments`             |
| Schedule       | `/api/v1/schedule`             |
| Usage          | `/api/v1/usage`                |
| Service Requests | `/api/v1/requests`           |
| Announcements  | `/api/v1/announcements`        |
| Notifications  | `/api/v1/notifications`        |

See the project prompt / route files under `src/modules/*/*.routes.ts` for
the full endpoint list — each module's routes mirror the spec exactly
(register, login, OTP, bills, Telebirr/CBE/Awash payments, Kebele schedules,
usage analytics, leak reports, announcements, and Expo push token
registration).

### Example: Login

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"abebe.bikila@example.com","password":"Password123!"}'
```

### Example: Authenticated Request

```bash
curl http://localhost:4000/api/v1/bills/current \
  -H "Authorization: Bearer <accessToken>"
```

---

## Project Structure

```
hydrolink-backend/
├── prisma/
│   ├── schema.prisma      # All models: User, Bill, Payment, Schedule, etc.
│   └── seed.ts            # Ethiopian sample data
├── src/
│   ├── config/            # env.ts, db.ts (Prisma client singleton)
│   ├── middlewares/        # auth guard, error handler, validate, rate limit
│   ├── modules/
│   │   ├── auth/           # register, login, OTP, refresh, reset password
│   │   ├── users/
│   │   ├── bills/
│   │   ├── payments/
│   │   ├── schedule/
│   │   ├── usage/
│   │   ├── requests/
│   │   ├── announcements/
│   │   └── notifications/
│   │       (each module: *.controller.ts, *.service.ts, *.routes.ts, *.validation.ts)
│   ├── utils/              # jwt, password hashing, OTP, apiResponse, AppError
│   ├── types/               # Express Request augmentation (req.user)
│   ├── app.ts                # Express app wiring
│   └── server.ts             # Entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Notes on Design Decisions

- **OTP delivery** is stubbed to `console.log` in `auth.service.ts` — swap in
  an SMS/email provider (e.g. a local Ethiopian SMS gateway or SendGrid) for
  production.
- **Payments** are modeled as `PENDING → SUCCESS/FAILED`. `POST
  /payments/:id/confirm` simulates the provider callback (Telebirr/CBE/Awash)
  that a real integration would receive via webhook.
- **Refresh tokens** are stored in the database and rotated on every refresh,
  so a stolen refresh token can be revoked.
- **Kebele-based scoping**: schedules and announcements are filtered by the
  requesting user's `kebele` field on their profile.

## Security Checklist Before Production

- [ ] Replace `JWT_SECRET` / `JWT_REFRESH_SECRET` with strong random values
- [ ] Put the API behind HTTPS (e.g. via a reverse proxy / load balancer)
- [ ] Wire up a real SMS/email provider for OTP delivery
- [ ] Integrate real Telebirr/CBE/Awash payment callbacks with signature verification
- [ ] Add request logging/monitoring (e.g. Sentry, CloudWatch)
- [ ] Review and tighten `express-rate-limit` thresholds for your expected traffic
