# PLATFORM — Build Instructions
> **Codename:** PLATFORM · **Owners:** Ayush (Data) · Basak (Vision/Idea) · **Target:** 5 Working Days

---

## 1. What We Are Building

A **multi-tenant SaaS platform** serving multiple companies (tenants) across four interconnected surfaces:

| Surface | Description |
|---|---|
| **Web App** (`apps/web`) | Primary browser interface — Admin, Manager, Super Admin dashboards |
| **Mobile App** (`apps/mobile`) | Native iOS & Android for field Engineers |
| **PWA** (built into `apps/web`) | Offline-capable lightweight view for on-site Engineers |
| **Backend API** (`services/`) | Central data & business logic serving all surfaces |

**Scale target:** 100,000 concurrent users  
**Licensing:** Platinum tier (all features unlocked) + 1-week free trial for new tenants  
**Compliance:** KYC verification required · Licensing gating enforced

---

## 2. Multi-Tenancy Model

- Every company that signs up is an isolated **Tenant**.
- Tenant data is **strictly isolated at the database level** — no cross-tenant data leakage.
- Each tenant manages its own users, products, and configurations independently.
- **Super Admin** is the platform owner — the only role with cross-tenant visibility.
- **Admin** exists within a single tenant only.

> The shared metadata layer (product catalogue, tenant registry, KYC records, licensing records, audit logs) is accessible only to Super Admin.

---

## 3. Role Hierarchy

```
Super Admin  ──►  Admin  ──►  Manager  ──►  Engineer
(Platform Owner)  (Tenant)    (Tenant)       (Field)
```

### Role Reference Table

| Role | Scope | App Access | Key Capabilities |
|---|---|---|---|
| **Super Admin / Owner** | Platform-wide | Web only | Onboard tenants, manage KYC & licensing, cross-tenant analytics, audit logs |
| **Admin** | Single tenant | Web only | Manage users/managers/engineers, configure tenant products, approve/reject KYC |
| **Manager** | Single tenant | Web + Mobile | Assign tasks to engineers, review & approve submissions, escalate to Admin |
| **Engineer** | Assigned tasks | Mobile + PWA | Fill forms, upload photos, submit work for review, must pass KYC first |

### Role Rules (Non-negotiable)

- Super Admin is **seeded at deployment** — cannot be created by any other role.
- Admin is created by **Super Admin** during tenant onboarding.
- Manager is created by **Admin only** — Managers cannot create other Managers.
- Engineer can be created by **Admin or Manager**.
- Engineer must complete **KYC before full platform access** is granted.

---

## 4. Project Structure Reference

```
saas-platform/
│
├── apps/
│   ├── web/                        ← Next.js (Admin + Manager + PWA)
│   │   ├── app/
│   │   │   ├── (auth)/login        ← Login page
│   │   │   ├── (auth)/register     ← Register page
│   │   │   ├── admin/              ← Admin dashboard, users, kyc, forms, licenses
│   │   │   ├── manager/            ← Manager dashboard, submissions, approvals
│   │   │   └── engineer/           ← Engineer PWA view
│   │   ├── components/             ← ui, tables, forms, layout
│   │   ├── lib/                    ← prisma.ts, auth.ts, api.ts
│   │   ├── services/               ← auth, user, form, submission service files
│   │   ├── middleware.ts           ← Auth + role-based route protection
│   │   ├── styles/
│   │   └── prisma/schema.prisma
│   │
│   └── mobile/                     ← React Native (Engineer app)
│       ├── App.js
│       ├── app.json
│       └── src/
│           ├── screens/            ← Auth, Dashboard, KYC, Forms, Camera, Submissions, Offline
│           ├── components/
│           ├── navigation/
│           ├── services/           ← api.js, auth.api.js, form.api.js, upload.api.js
│           ├── store/
│           ├── utils/
│           └── hooks/
│
├── services/                       ← Microservices backend
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-service/
│   ├── tenant-service/
│   ├── kyc-service/
│   ├── form-service/
│   ├── submission-service/
│   ├── photo-service/
│   ├── license-service/
│   └── notification-service/
│
├── packages/                       ← Shared code
│   ├── ui/                         ← Shared UI components
│   ├── config/                     ← Env configs
│   ├── utils/                      ← Helpers
│   └── types/                      ← Shared TypeScript interfaces
│
├── infra/                          ← DevOps & deployment
│   ├── docker/
│   ├── nginx/
│   └── k8s/
│
├── .env                            ← Environment variables
└── README.md
```

---

## 5. Core Features by Role

### Super Admin
- [ ] Tenant onboarding flow (create company + seed Admin account)
- [ ] Global product & company metadata management
- [ ] KYC trigger, review, approve/reject per tenant
- [ ] Licensing tier assignment & revocation (Platinum / Trial)
- [ ] Cross-tenant analytics dashboard
- [ ] Audit log viewer (all critical actions, all tenants)

### Admin (per tenant)
- [ ] User management — create/edit/deactivate Managers & Engineers
- [ ] Tenant-level settings & product configuration
- [ ] KYC document review for Engineers within their tenant
- [ ] Full reports & submissions viewer for their tenant

### Manager (per tenant)
- [ ] Assign work orders / tasks to Engineers
- [ ] Review Engineer form submissions & photographs
- [ ] Approve or escalate submissions to Admin
- [ ] Cannot create other Managers

### Engineer (field)
- [ ] KYC document upload (mobile)
- [ ] Form list & form fill (validated, mobile-first)
- [ ] Photograph capture & upload (stored to database)
- [ ] Work submission → Manager review queue
- [ ] Offline draft support (PWA / mobile)
- [ ] Submission status tracking

---

## 6. Key Technical Decisions

| Concern | Decision |
|---|---|
| Web framework | Next.js (App Router) |
| Mobile framework | React Native |
| API style | REST via microservices behind API Gateway |
| Auth | JWT-based, role-encoded claims |
| Database isolation | Per-tenant schema or row-level tenancy with `tenant_id` |
| Photo storage | Direct database blob or object storage (e.g. S3-compatible) |
| Offline support | PWA service worker + mobile local drafts store |
| Licensing gate | Middleware checks license tier on every protected route |
| KYC gate | Engineer routes blocked until KYC status = `APPROVED` |

---

## 7. Service Responsibilities

| Service | Owns |
|---|---|
| `api-gateway` | Route all external traffic, rate limiting, auth header forwarding |
| `auth-service` | Login, register, JWT issue & refresh, role resolution |
| `user-service` | CRUD for Super Admin, Admin, Manager, Engineer records |
| `tenant-service` | Tenant onboarding, settings, metadata |
| `kyc-service` | Document upload, verification status, approval workflow |
| `form-service` | Form definitions, validation rules, field schemas |
| `submission-service` | Submitted form data, approval/rejection workflow |
| `photo-service` | Photo upload, storage, retrieval |
| `license-service` | License tier management, expiry checks, trial logic |
| `notification-service` | Email/push alerts for approvals, KYC updates, task assignments |

---

## 8. Day-by-Day Build Plan (5 Days)

| Day | Focus |
|---|---|
| **Day 1** | DB schema, auth-service, user-service, tenant-service, role middleware |
| **Day 2** | KYC service, license service, Super Admin web UI, tenant onboarding flow |
| **Day 3** | Form service, submission service, Admin + Manager web UI |
| **Day 4** | Mobile app — Auth, KYC upload, Form fill, Camera, Submission status, Offline drafts |
| **Day 5** | API Gateway, notification service, PWA setup, end-to-end testing, infra / Docker wiring |

---

## 9. Environment Variables (`.env`)

> Fill these before any service is started.

```
# Database
DATABASE_URL=

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=

# Services (internal URLs)
AUTH_SERVICE_URL=
USER_SERVICE_URL=
TENANT_SERVICE_URL=
KYC_SERVICE_URL=
FORM_SERVICE_URL=
SUBMISSION_SERVICE_URL=
PHOTO_SERVICE_URL=
LICENSE_SERVICE_URL=
NOTIFICATION_SERVICE_URL=

# Storage (photo uploads)
STORAGE_BUCKET=
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

# Notifications
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

---

## 10. Ground Rules

1. **No cross-tenant data access** — every DB query must be scoped by `tenant_id`.
2. **KYC gate first** — Engineers cannot access any platform feature until KYC is `APPROVED`.
3. **License gate** — All feature routes check license tier; expired/trial-exceeded tenants are locked to read-only.
4. **Role middleware on every route** — no route is unprotected except `/login` and `/register`.
5. **Super Admin is seeded** — never expose a public API to create Super Admin accounts.
6. **Photos stored server-side** — no client-side only storage; all uploads must reach the backend.
7. **Offline-first for Engineers** — mobile and PWA must queue submissions locally when offline and sync on reconnect.
