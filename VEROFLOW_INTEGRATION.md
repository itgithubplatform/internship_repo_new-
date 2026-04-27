# VeroFlow Mobile & Web Integration Guide

## Overview
VeroFlow is a unified multi-tenant SaaS platform with a web dashboard and native mobile app for field operations. This guide explains how to integrate both platforms.

---

## Platform Architecture

```
VeroFlow Ecosystem
├── Web App (Next.js)
│   ├── Landing Page
│   ├── Admin Dashboard
│   ├── Manager Portal
│   └── Analytics
│
├── Mobile App (React Native/Expo)
│   ├── Field Operations
│   ├── KYC Verification
│   ├── Form Capture
│   └── Offline Support
│
└── Shared Backend Services
    ├── Auth Service (JWT)
    ├── KYC Service
    ├── Form Service
    ├── Submission Service
    └── User Service
```

---

## Authentication Flow

### Single Sign-On (SSO) Integration

**Web Login:**
```
User → Web Login → Auth Service → JWT Token → Dashboard
```

**Mobile Login:**
```
User → Mobile Login → Auth Service → JWT Token → Mobile App
```

Both platforms share the same JWT-based authentication with tenant isolation.

---

## API Integration Points

### Shared Endpoints

| Endpoint | Purpose | Web | Mobile |
|----------|---------|-----|--------|
| `/auth/login` | User authentication | ✓ | ✓ |
| `/users/{id}` | User profile | ✓ | ✓ |
| `/tenants/{id}` | Tenant data | ✓ | ✓ |
| `/forms/{id}` | Form templates | ✓ | ✓ |
| `/submissions` | Data submissions | ✓ | ✓ |
| `/kyc/{id}` | KYC verification | ✓ | ✓ |
| `/analytics` | Dashboard analytics | ✓ | - |

---

## Web App Integration

### Environment Setup

**File:** `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AUTH_URL=http://localhost:3001/auth
NEXT_PUBLIC_TENANT_ID=default
```

### Dashboard Components

**Location:** `apps/web/components/`

- **Admin Dashboard:** Manage tenants, users, and configurations
- **Manager Portal:** Approve submissions, view team performance
- **Analytics:** Real-time insights and reporting
- **Landing Page:** New branded landing page (VeroFlow)

### Key Features

✓ Multi-tenant management
✓ Role-based access (Admin, Manager, Engineer)
✓ Real-time dashboards
✓ KYC verification pipeline
✓ Form management
✓ Submission analytics

---

## Mobile App Integration

### Environment Setup

**File:** `apps/mobile/.env`

```env
VITE_API_URL=http://localhost:3000/api
VITE_AUTH_URL=http://localhost:3001/auth
VITE_TENANT_ID=default
VITE_ENABLE_OFFLINE=true
```

### Mobile-Specific Features

✓ Offline-first PWA architecture
✓ Camera integration for photo capture
✓ Form submission with geo-tagging
✓ Real-time sync when online
✓ Push notifications
✓ Biometric authentication (optional)

### Navigation Structure

**File:** `apps/mobile/src/navigation/`

```
Mobile Navigation
├── Auth Stack
│   ├── Login
│   └── Registration
├── App Stack
│   ├── Dashboard
│   ├── Assignments
│   ├── Form Capture
│   ├── KYC Verification
│   ├── Photo Upload
│   └── Profile
└── Settings
    ├── Account
    ├── Permissions
    └── Offline Mode
```

---

## Data Synchronization

### Real-Time Sync Strategy

**Web → Mobile:**
- Form templates updates
- New work assignments
- Approval status changes

**Mobile → Web:**
- Form submissions
- Photo uploads
- KYC verification data
- Field notes

### Offline Support

```typescript
// Mobile offline handling
const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState([]);

  // Queue submissions when offline
  const submitForm = async (data) => {
    if (isOnline) {
      return await api.submitForm(data);
    } else {
      setPendingSync([...pendingSync, data]);
      // Sync when online
    }
  };

  return { isOnline, submitForm, pendingSync };
};
```

---

## Shared Services

### Services Location

**File:** `packages/tenant-core/src/services/`

All backend services are shared and available to both web and mobile:

- **AuthService** - JWT token management
- **UserService** - User management
- **TenantService** - Multi-tenant operations
- **FormService** - Form template engine
- **KYCService** - Verification workflows
- **SubmissionService** - Data ingestion and processing

### Service Integration Example

```typescript
// Web & Mobile use the same service
import { FormService } from '@packages/tenant-core/services';

const formService = new FormService(tenantId, authToken);
const forms = await formService.getForms();
const submission = await formService.submitForm(formId, data);
```

---

## Deployment

### Web Deployment

```bash
cd apps/web
npm run build
npm run start
```

**Deployed to:** Vercel / AWS / Azure

### Mobile Deployment

```bash
cd apps/mobile
npm run build
npm run android  # Android app
npm run ios      # iOS app
```

**Available on:** Google Play Store, Apple App Store

### Backend Services

```bash
cd services
docker-compose up

# Individual services
cd kyc-service && npm start
cd form-service && npm start
cd submission-service && npm start
```

---

## Security & Compliance

### Authentication
- ✓ JWT tokens with 24h expiration
- ✓ Refresh token rotation
- ✓ HTTPS/TLS encryption

### Data Protection
- ✓ AES-256 encryption at rest
- ✓ Row-level security by tenant
- ✓ Audit logging for all operations

### Privacy
- ✓ GDPR compliant
- ✓ Data residency options
- ✓ Deletion on demand

---

## Development Workflow

### Local Development Setup

```bash
# Clone repository
git clone <repo>
cd multitenant-saas-platform

# Install dependencies
npm install

# Set up environment files
cp .env.example .env.local

# Start services
npm run dev

# Access:
# Web: http://localhost:3000
# Mobile: http://localhost:8081
# API: http://localhost:3001
```

### Key Files & Directories

```
apps/web/
├── app/page.tsx              # Landing page
├── components/landing/       # Landing page components
├── (auth)/                   # Auth pages
├── admin/                    # Admin dashboard
├── manager/                  # Manager portal
└── engineer/                 # Engineer interface

apps/mobile/
├── src/screens/              # Mobile screens
├── src/services/             # API services
├── src/navigation/           # Navigation structure
└── src/store/                # Redux state management

services/
├── api-gateway/              # API Gateway
├── auth-service/             # Auth
├── kyc-service/              # KYC
├── form-service/             # Forms
└── submission-service/       # Submissions
```

---

## Common Integration Tasks

### 1. Add a New Form Type (Web & Mobile)

**Step 1:** Update form schema
```typescript
// packages/types/kyc.ts
export interface FormField {
  id: string;
  type: 'text' | 'select' | 'date' | 'photo';
  label: string;
  required: boolean;
}
```

**Step 2:** Update FormService
```typescript
// services/form-service/src/services/formService.ts
async createForm(tenantId: string, formData: FormInput) {
  // Validate and create form
}
```

**Step 3:** Update web components
```typescript
// apps/web/components/forms/FormBuilder.tsx
// Add new form type support
```

**Step 4:** Update mobile components
```typescript
// apps/mobile/src/components/FormCapture.tsx
// Add new form type support
```

---

### 2. Add a New API Endpoint

**Step 1:** Update API Gateway
```typescript
// services/api-gateway/src/routes
router.post('/submissions', requireAuth, controller.createSubmission);
```

**Step 2:** Update service
```typescript
// services/submission-service/src/controllers
async createSubmission(req, res) {
  // Handler
}
```

**Step 3:** Update shared types
```typescript
// packages/types/submission.ts
export interface SubmissionInput {
  formId: string;
  data: Record<string, any>;
}
```

**Step 4:** Use in both web and mobile
```typescript
// Web
const submission = await submissionService.create(data);

// Mobile
const submission = await submissionService.create(data);
```

---

## Troubleshooting

### Issue: Mobile app can't connect to API

**Solution:**
```bash
# Check API URL in .env
# Ensure backend services are running
# Verify JWT token is valid
npm run logs  # Check service logs
```

### Issue: Form submissions not syncing

**Solution:**
```typescript
// Force sync
await syncQueue.processPendingSubmissions();
// Check network status
console.log(isOnline);
```

### Issue: JWT token expired

**Solution:**
```typescript
// Token refresh is automatic, but if not:
const newToken = await authService.refresh();
localStorage.setItem('token', newToken);
```

---

## Support & Resources

- **Documentation:** [docs.veroflow.com](https://docs.veroflow.com)
- **API Reference:** [api.veroflow.com/docs](https://api.veroflow.com/docs)
- **Community:** [community.veroflow.com](https://community.veroflow.com)
- **Support:** support@veroflow.com

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2026 | Initial release |
| 1.1.0 | Feb 2026 | Mobile app launch |
| 1.2.0 | Mar 2026 | KYC enhancements |
| 2.0.0 | Apr 2026 | Landing page redesign |

---

**Last Updated:** April 27, 2026  
**Platform:** VeroFlow  
**Status:** Production Ready
