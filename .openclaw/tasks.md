# OpenClaw Automation Tasks

This file defines tasks for OpenClaw to automate. Update this file to add new automation workflows.

## Active Automations

### 1. CI/CD Pipeline
**Trigger:** Push to `main` or PR created
**Actions:**
- Run TypeScript type check (`npm run check`)
- Build application (`npm run build`)
- Deploy to Railway (if main branch)

### 2. Health Monitoring
**Trigger:** Every 15 minutes
**Actions:**
- Check `/api/health` endpoint
- Alert if status != "ok" or timeout > 5s
- Notify via configured channel (Telegram/Discord)

### 3. Dependency Updates
**Trigger:** Weekly (Monday 9am)
**Actions:**
- Run `npm audit`
- Check for outdated packages
- Create PR with updates if safe

---

## Pending Tasks (AI To-Do)

### High Priority
- [ ] **Add test coverage** - Create vitest tests for critical paths
  - Auth endpoints
  - Product CRUD
  - SAP sync service

- [ ] **Split routes.ts** - Refactor into feature modules
  - `routes/products.ts`
  - `routes/auth.ts`
  - `routes/iot.ts`
  - `routes/integrations.ts`

### Medium Priority
- [ ] **Add OpenAPI docs** - Generate Swagger spec
- [ ] **Implement pagination** - Add limit/offset to list endpoints
- [ ] **Structured logging** - Replace console.log with Winston/Pino

### Low Priority
- [ ] **Add E2E tests** - Playwright for frontend
- [ ] **Performance monitoring** - Add APM integration
- [ ] **Docker optimization** - Multi-stage build

---

## Code Review Rules

When reviewing PRs, check for:
1. TypeScript types (no `any` unless necessary)
2. Authentication on all API endpoints
3. Zod validation for request bodies
4. Error handling with try/catch
5. No hardcoded secrets

---

## Deployment Checklist

Before deploying to production:
1. [ ] All type checks pass
2. [ ] Build succeeds
3. [ ] Environment variables set:
   - DATABASE_URL
   - SESSION_SECRET (64+ chars)
   - MASTER_ADMIN_EMAILS
4. [ ] Database migrations applied
5. [ ] Health endpoint responds

---

## Emergency Procedures

### Database Issues
```bash
# Check connection
npm run setup

# Reset and reseed (DEV ONLY)
npm run db:push
# Then call POST /api/admin/seed-demo-data
```

### Auth Issues
- Check SESSION_SECRET is set
- Verify OAuth credentials (Google/Microsoft)
- Check ALLOWED_ORIGINS for CORS

### Rollback
```bash
# Railway rollback via CLI
railway rollback
```

---

## Integration Points

### GitHub
- Repository: https://github.com/dillib/photonictag
- Branch protection: `main` requires PR review
- Secrets: RAILWAY_TOKEN, RAILWAY_SERVICE_ID

### Railway
- Project: photonictag
- Services: web (Node.js), postgres
- Health check: /api/health

### External APIs
- OpenAI: AI product insights
- Nodemailer: Email notifications
