# PhotonicTag MVP Sprint Plan

**Goal**: Working MVP for the core flow:
```
Manufacturer logs in → Creates product → Enters DPP data → Gets QR code → Consumer scans QR → Sees product passport
```

**Timeline**: 1 Week Sprint

---

## Day 1: Environment Setup & Bug Fixes

### Task 1.1: Fix Replit-Specific Code (2 hours)

**File: `server/services/qr-service.ts`**
```typescript
// CHANGE FROM:
const scanUrl = `${process.env.REPLIT_DEV_DOMAIN || "http://localhost:5000"}/product/${productId}`;

// CHANGE TO:
const scanUrl = `${process.env.APP_URL || "http://localhost:5000"}/product/${productId}`;
```

**File: `vite.config.ts`** - Remove Replit plugins (see MIGRATION_PLAN.md)

**File: `package.json`** - Remove Replit dependencies

### Task 1.2: Create Environment File (30 min)

**File: `.env.example`**
```env
# Required
DATABASE_URL=postgresql://user:pass@localhost:5432/photonictag
SESSION_SECRET=your-64-char-secret-here
APP_URL=http://localhost:5000
PORT=5000
NODE_ENV=development

# Optional - for Google SSO
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optional - for AI features
OPENAI_API_KEY=
```

### Task 1.3: Deploy to Railway (1 hour)
- Create Railway account
- Deploy from GitHub
- Add PostgreSQL
- Configure environment variables
- Get working URL

---

## Day 2: Authentication Testing

### Task 2.1: Test Local Auth Flow (2 hours)
- [ ] Register new user
- [ ] Verify email (if configured) or skip
- [ ] Login with credentials
- [ ] Verify session persists
- [ ] Logout works

### Task 2.2: Fix Auth Issues (as needed)
- Debug any registration errors
- Fix session handling if broken
- Ensure protected routes work

---

## Day 3: Product Creation Flow

### Task 3.1: Test Product CRUD (2 hours)
- [ ] Create new product with minimal data
- [ ] View product in list
- [ ] View product detail page
- [ ] Edit product
- [ ] Delete product

### Task 3.2: Test DPP Data Entry (2 hours)
- [ ] Fill all required DPP fields
- [ ] Test field validation
- [ ] Save and verify data persists
- [ ] Test optional fields

---

## Day 4: QR Code & Scanning

### Task 4.1: Test QR Generation (1 hour)
- [ ] Create product
- [ ] Verify QR code is auto-generated
- [ ] QR code displays on product detail
- [ ] QR code is downloadable/printable

### Task 4.2: Test Public Scan Flow (2 hours)
- [ ] Scan QR code with phone
- [ ] Public page loads (no login required)
- [ ] All DPP data displays correctly
- [ ] Page works on mobile
- [ ] Test with different products

---

## Day 5: Polish & Edge Cases

### Task 5.1: UI Polish (2 hours)
- [ ] Fix any broken layouts
- [ ] Ensure mobile responsiveness
- [ ] Test dark/light mode
- [ ] Fix any missing icons/images

### Task 5.2: Error Handling (2 hours)
- [ ] Product not found → proper 404
- [ ] Invalid QR code → helpful error
- [ ] Form validation errors display
- [ ] API errors handled gracefully

---

## Day 6: Integration Testing

### Task 6.1: Full Flow Test (3 hours)
Run through complete flow 5 times:
1. Register new account
2. Login
3. Create product with full DPP data
4. Get QR code
5. Scan QR on different device
6. Verify all data shows correctly

### Task 6.2: Multi-User Test (1 hour)
- [ ] Two users can't see each other's products
- [ ] Each user has their own dashboard

---

## Day 7: Documentation & Launch Prep

### Task 7.1: Create User Guide (2 hours)
- Quick start guide for manufacturers
- How to create first product
- How to print/share QR codes

### Task 7.2: Prepare Demo Account (1 hour)
- Create demo@photonictag.com account
- Add 3-5 sample products
- Pre-generate QR codes

### Task 7.3: Launch Checklist (1 hour)
- [ ] Custom domain working
- [ ] SSL certificate active
- [ ] Error monitoring set up
- [ ] Backup configured
- [ ] Ready for first users

---

## Bug Fixes Identified

### Critical (Must Fix)

1. **QR Service URL Bug**
   - File: `server/services/qr-service.ts`
   - Issue: Uses `REPLIT_DEV_DOMAIN`
   - Fix: Change to `APP_URL`

2. **Replit Vite Plugins**
   - File: `vite.config.ts`
   - Issue: Replit-specific plugins will fail
   - Fix: Remove Replit plugins

### Medium (Should Fix)

3. **Session Secret**
   - File: `server/auth/index.ts`
   - Issue: Hardcoded fallback secret
   - Fix: Require SESSION_SECRET in production

4. **Dev Bypass Auth**
   - File: `server/auth/index.ts`
   - Issue: DEV_BYPASS_AUTH could be security risk
   - Fix: Only allow in development

---

## Success Criteria

MVP is complete when:
- [ ] User can register and login
- [ ] User can create product with DPP data
- [ ] QR code is generated automatically
- [ ] Anyone can scan QR and see product passport
- [ ] Works on desktop and mobile
- [ ] Deployed on production URL

---

## Commands Reference

```bash
# Local Development
npm install
npm run db:push          # Push schema to database
npm run dev              # Start dev server

# Production Build
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:push          # Push schema changes
```

---

*Sprint Plan by OpenClaw AI - 2026-01-31*
