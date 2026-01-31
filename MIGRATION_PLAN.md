# PhotonicTag: Migration from Replit to Standalone Platform

**Created**: 2026-01-31
**Status**: Ready for Implementation

---

## Executive Summary

PhotonicTag is a **production-ready SaaS application** with:
- 188 source files
- Full-stack TypeScript (React + Express)
- PostgreSQL database with Drizzle ORM
- Multi-tenant authentication (Google, Microsoft, Local)
- SAP integration, IoT device management, AI insights
- Lead capture, marketing pages, admin dashboard

**Recommended Migration Path**: Railway (all-in-one) or Fly.io + Supabase

---

## Current Architecture

```
┌─────────────────────────────────────────────────┐
│                    REPLIT                        │
│  ┌──────────────┐    ┌──────────────────────┐   │
│  │   Vite Dev   │    │   Express Server     │   │
│  │   (React)    │────│   (API + Static)     │   │
│  └──────────────┘    └──────────┬───────────┘   │
│                                  │               │
│                      ┌───────────▼───────────┐   │
│                      │     PostgreSQL        │   │
│                      │  (Replit Database)    │   │
│                      └───────────────────────┘   │
└─────────────────────────────────────────────────┘
         │
         │ Cloudflare DNS
         ▼
   photonictag.com
```

---

## Target Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        OPTION A: RAILWAY                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Railway Service                      │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │        Node.js (Express + Static React)      │    │   │
│  │  │                  Port 5000                   │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │                         │                            │   │
│  │  ┌─────────────────────▼───────────────────────┐    │   │
│  │  │           Railway PostgreSQL                 │    │   │
│  │  │         (Managed, auto-backups)              │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
         │
         │ Cloudflare DNS (update A record)
         ▼
   photonictag.com
```

---

## Environment Variables Required

```env
# REQUIRED
DATABASE_URL=postgresql://user:pass@host:5432/photonictag
SESSION_SECRET=generate-a-64-char-random-string
PORT=5000
NODE_ENV=production
APP_URL=https://photonictag.com

# OPTIONAL - SSO (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OPTIONAL - SSO (Microsoft)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# OPTIONAL - Email Notifications
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=your-resend-api-key
EMAIL_FROM=noreply@photonictag.com

# OPTIONAL - AI Features
OPENAI_API_KEY=your-openai-api-key
```

---

## Code Changes Required

### 1. Remove Replit-Specific Dependencies

**File: `package.json`**
Remove these devDependencies:
```json
"@replit/vite-plugin-cartographer": "^0.4.4",
"@replit/vite-plugin-dev-banner": "^0.1.1",
"@replit/vite-plugin-runtime-error-modal": "^0.0.3",
```

### 2. Update Vite Config

**File: `vite.config.ts`**
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});
```

### 3. Update Server Bootstrap

**File: `server/bootstrap.ts`** - Already good, just ensure dotenv is loaded first.

### 4. Remove Replit Auth References

**File: `server/replit_integrations/auth/replitAuth.ts`**
- Keep the local auth strategy
- Remove REPL_ID checks
- Use standard session store

### 5. Update package.json scripts

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/bootstrap.ts",
    "build": "tsx script/build.ts",
    "start": "NODE_ENV=production node dist/index.cjs",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate"
  }
}
```

---

## Migration Options Comparison

| Feature | Railway | Fly.io + Supabase | DigitalOcean | VPS |
|---------|---------|-------------------|--------------|-----|
| **Setup Time** | 30 min | 1 hour | 1 hour | 2-3 hours |
| **Monthly Cost** | $5-20 | $5-15 | $12-24 | $5-10 |
| **Auto Deploy** | ✅ GitHub | ✅ GitHub | ✅ GitHub | Manual |
| **Managed DB** | ✅ | ✅ Supabase | ✅ | ❌ Self-manage |
| **Scaling** | Auto | Auto | Manual | Manual |
| **SSL** | Auto | Auto | Auto | Let's Encrypt |
| **Complexity** | Low | Medium | Medium | High |

### Recommendation: **Railway** (Fastest, simplest, good free tier)

---

## Step-by-Step Migration Guide

### Phase 1: Prepare Codebase (30 min)

```bash
# 1. Clone repo locally
git clone https://github.com/dillib/photonictag.git
cd photonictag

# 2. Create migration branch
git checkout -b migrate-from-replit

# 3. Remove Replit dependencies
npm uninstall @replit/vite-plugin-cartographer @replit/vite-plugin-dev-banner @replit/vite-plugin-runtime-error-modal

# 4. Update vite.config.ts (remove Replit plugins)
# See code changes above

# 5. Test build locally
npm run build

# 6. Commit changes
git add .
git commit -m "Remove Replit dependencies for standalone deployment"
git push origin migrate-from-replit
```

### Phase 2: Set Up Railway (20 min)

```bash
# 1. Go to https://railway.app
# 2. Sign in with GitHub
# 3. Click "New Project" → "Deploy from GitHub repo"
# 4. Select dillib/photonictag
# 5. Railway auto-detects Node.js

# 6. Add PostgreSQL
# - Click "New" → "Database" → "PostgreSQL"
# - Railway auto-creates DATABASE_URL

# 7. Add Environment Variables:
# - SESSION_SECRET (generate: openssl rand -hex 32)
# - APP_URL=https://your-app.railway.app (initially)
# - NODE_ENV=production
# - Any optional vars (Google SSO, OpenAI, etc.)

# 8. Configure Build Settings:
# - Build Command: npm run build
# - Start Command: npm start
# - Watch Path: /

# 9. Deploy!
```

### Phase 3: Database Migration (15 min)

```bash
# Option A: Fresh Start (recommended for early stage)
# Railway creates empty DB, app auto-seeds demo data

# Option B: Migrate existing data
# 1. Export from Replit PostgreSQL
pg_dump $REPLIT_DATABASE_URL > backup.sql

# 2. Import to Railway PostgreSQL
psql $RAILWAY_DATABASE_URL < backup.sql
```

### Phase 4: DNS Configuration (10 min)

```bash
# 1. In Railway, go to Settings → Domains
# 2. Add custom domain: photonictag.com
# 3. Railway provides CNAME target

# 4. In Cloudflare:
# - Delete old A record pointing to Replit
# - Add CNAME: @ → your-app.railway.app
# - Enable proxy (orange cloud)

# 5. Wait for DNS propagation (5-30 min)
```

### Phase 5: Verify & Test (15 min)

```bash
# Test checklist:
[ ] Landing page loads
[ ] Can create account (local auth)
[ ] Can login
[ ] Can create product
[ ] QR code generates
[ ] Public scan page works
[ ] Lead capture works
[ ] Contact form works
[ ] Demo gallery works
```

---

## Post-Migration Tasks

### Immediate (Day 1)
- [ ] Verify all pages load correctly
- [ ] Test authentication flows
- [ ] Test product CRUD operations
- [ ] Verify lead capture works
- [ ] Set up error monitoring (Sentry - free tier)

### Week 1
- [ ] Set up Google SSO (if needed)
- [ ] Configure email notifications (Resend)
- [ ] Enable OpenAI for AI insights
- [ ] Set up automated backups
- [ ] Configure custom domain SSL

### Week 2
- [ ] Set up monitoring dashboards
- [ ] Configure auto-scaling rules
- [ ] Implement rate limiting
- [ ] Add health check endpoint

---

## Cost Breakdown

### Railway (Recommended)
| Resource | Free Tier | Paid (Hobby) |
|----------|-----------|--------------|
| Compute | $5 credit/month | $5-10/month |
| PostgreSQL | 1GB free | $5-10/month |
| Bandwidth | 100GB | Included |
| **Total** | **$0** (within limits) | **$10-20/month** |

### Fly.io + Supabase Alternative
| Resource | Free Tier | Paid |
|----------|-----------|------|
| Fly.io Compute | 3 shared VMs | $5-10/month |
| Supabase DB | 500MB | $25/month |
| **Total** | **$0** | **$30-35/month** |

---

## Rollback Plan

If migration fails:
1. Repoint Cloudflare DNS back to Replit
2. Replit app should still be running
3. Investigate issues on Railway
4. Re-attempt migration

---

## Files to Create/Modify

### New Files
- `.env.example` (template for environment variables)
- `railway.json` (Railway config, optional)
- `Dockerfile` (optional, Railway auto-detects Node.js)

### Modified Files
- `package.json` (remove Replit deps)
- `vite.config.ts` (remove Replit plugins)
- `server/auth/index.ts` (simplify session handling)

---

## Next Steps

1. **Approve this plan** - Let me know if you want to proceed
2. **I'll create a PR** with all code changes
3. **You create Railway account** and link GitHub
4. **We deploy together** and verify everything works

Ready to proceed?

---

*Migration Plan by OpenClaw AI - 2026-01-31*
