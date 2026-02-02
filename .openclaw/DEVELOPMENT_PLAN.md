# PhotonicTag Development Plan
## Token-Efficient AI Agent Strategy

**Last Updated:** 2026-02-02

---

## 🎯 Goal
Build production-ready PhotonicTag with minimal token burn while maximizing AI effectiveness.

---

## 🤖 AI Agent Usage Strategy

### Rule 1: Use Sub-Agents for Isolated Tasks
**Why:** Sub-agents run in separate sessions, keeping main context clean and burning tokens only when needed.

**Use Sub-Agents For:**
- Code refactoring (splitting routes.ts)
- Writing tests (isolated test files)
- Documentation updates
- Dependency audits
- Building new features

**Example:**
```
# Instead of asking main agent to refactor:
"Hey, refactor routes.ts into modules"

# Spawn a sub-agent:
/spawn task="Refactor server/routes.ts into feature modules: routes/products.ts, routes/auth.ts, routes/iot.ts, routes/integrations.ts. Follow TypeScript strict mode. Preserve all existing functionality." cleanup=keep
```

### Rule 2: Use Memory Files, Not Conversations
**Why:** Context window is expensive. Memory files are permanent and free to read.

**Store in Files:**
- Design decisions → `.openclaw/decisions.md`
- Architecture notes → `.openclaw/architecture.md`
- Known bugs → `.openclaw/known-issues.md`
- Progress tracking → `.openclaw/progress.md`

**Ask Agent to Update:**
```
"Update .openclaw/decisions.md with: We chose Railway over Vercel for backend because..."
```

### Rule 3: Batch Similar Tasks
**Why:** One agent session can handle multiple related tasks efficiently.

**Good:**
```
"Review and fix all TypeScript type errors in server/ directory, then run type check"
```

**Bad:**
```
"Fix type error in routes.ts"
... [new session]
"Fix type error in storage.ts"
... [repeat 10x]
```

### Rule 4: Use Heartbeats for Monitoring
**Why:** Automated checks run in background, no manual token burn.

**Configure in `.openclaw/HEARTBEAT.md`:**
```markdown
# Heartbeat Tasks

## Every 6 hours:
- Check /api/health endpoint (if deployed)
- Check GitHub for new issues
- Check Railway deployment status

## Every 24 hours:
- Run npm audit
- Check for outdated dependencies
- Review open PRs

## Report only if:
- Health check fails
- Critical vulnerability found
- PR needs review
```

---

## 💰 Hosting Strategy Analysis

### Option A: Vercel + Railway (Current Plan)
**Monthly Cost:** ~$5-10

| Component | Service | Tier | Cost |
|-----------|---------|------|------|
| Frontend | Vercel | Hobby | $0 |
| Backend API | Railway | Hobby | $5 |
| Database | Railway Postgres | Shared | $0-5 |
| Domain | Cloudflare | Free | $0 |

**Pros:**
- ✅ Zero config deployment
- ✅ Auto-deploy from GitHub
- ✅ Great free tiers
- ✅ Built-in CI/CD
- ✅ Easy rollbacks

**Cons:**
- ❌ Railway Hobby has limits (512MB RAM, 1GB storage)
- ❌ Vercel functions have 10s timeout
- ❌ No direct server access

**Best For:** Validation phase (0-100 users)

---

### Option B: Hetzner VPS (Recommended for Scale)
**Monthly Cost:** ~$5-20

| Tier | RAM | CPU | Storage | Monthly | Best For |
|------|-----|-----|---------|---------|----------|
| CX11 | 2GB | 1 vCPU | 20GB | €4.51 (~$5) | Dev/Staging |
| CX21 | 4GB | 2 vCPU | 40GB | €6.40 (~$7) | Production (0-500 users) |
| CX31 | 8GB | 2 vCPU | 80GB | €11.90 (~$13) | Production (500-2000 users) |

**Setup on Hetzner:**
```bash
# On VPS:
1. Install Docker + Docker Compose
2. Clone repo
3. Run docker-compose up -d
4. Set up Caddy for HTTPS (auto Let's Encrypt)
5. Point photonictag.com DNS to VPS IP
```

**Docker Compose Stack:**
- Nginx/Caddy (reverse proxy + HTTPS)
- Node.js API (your Express app)
- PostgreSQL (persistent volumes)
- Redis (optional, for caching)

**Pros:**
- ✅ Full control
- ✅ Much cheaper at scale
- ✅ No vendor lock-in
- ✅ Better performance
- ✅ Can run background jobs

**Cons:**
- ❌ You manage updates/security
- ❌ Manual deployment setup
- ❌ No built-in CI/CD (need GitHub Actions)

**Best For:** After validation (100+ users, generating revenue)

---

### Option C: Hybrid (Best of Both)
**Monthly Cost:** ~$5-8

**Phase 1 (Now - 3 months):**
- Frontend: Vercel (free)
- Backend + DB: Railway ($5)
- **Goal:** Validate, get first customers

**Phase 2 (Month 4+):**
- Frontend: Vercel (free) or Hetzner + Caddy
- Backend + DB: Hetzner CX21 ($7)
- **Goal:** Scale cost-effectively

**Migration Path:**
1. Set up Hetzner VPS
2. Deploy via Docker Compose
3. Test on staging.photonictag.com
4. Switch DNS
5. Keep Railway as backup for 1 week

---

## 📋 Recommended Hosting Plan

### For Right Now (Validation Phase)
**Use Railway + Vercel**
- Cost: $5/month
- Time to deploy: 10 minutes
- Focus on getting customers, not infrastructure

### When to Switch to Hetzner
**Triggers:**
- You have 5+ paying customers
- Monthly recurring revenue > $500
- Railway costs > $20/month
- You need background jobs/cron

---

## 🚀 Development Workflow (Token-Efficient)

### Daily Development
```bash
# 1. Pull latest
git pull origin main

# 2. Create feature branch
git checkout -b feature/add-email-notifications

# 3. SPAWN sub-agent for isolated work
/spawn task="Implement email notifications using Resend. Add to server/services/email-service.ts. Add endpoint POST /api/leads/:id/send-email. Update lead status on send." model=sonnet cleanup=keep

# 4. Review output, test locally
npm run dev

# 5. Commit and push
git add .
git commit -m "feat: add email notifications"
git push origin feature/add-email-notifications

# 6. Create PR on GitHub
# Railway auto-deploys preview environment
```

### Weekly Maintenance (Automated)
Add to `.openclaw/HEARTBEAT.md`:
```markdown
# Weekly Tasks (Monday 9am)
- Run npm audit
- Check Railway deployment health
- Review GitHub issues
- Update progress in .openclaw/progress.md
```

### Monthly Reviews (30 min with agent)
```
"Review .openclaw/progress.md. Summarize:
1. Features completed
2. Bugs fixed
3. Technical debt added
4. Recommendations for next month"
```

---

## 🎯 Next 4 Weeks (Token Budget: ~50k/week)

### Week 1: Stabilize & Deploy
**Goal:** Production-ready on Railway

**Tasks (use sub-agents):**
- [ ] Fix TypeScript errors (`/spawn task="Fix all TypeScript strict errors"`)
- [ ] Add health endpoint tests
- [ ] Deploy to Railway
- [ ] Set up Vercel frontend
- [ ] Test end-to-end

**Token Budget:** 30k (mostly sub-agents)

---

### Week 2: Customer-Ready Features
**Goal:** Make demo flow seamless

**Tasks:**
- [ ] Add Calendly integration
- [ ] Implement lead email notifications
- [ ] Polish SAP connector UI
- [ ] Add demo video to landing page

**Token Budget:** 40k (UI work needs main agent)

---

### Week 3: Validation & Feedback
**Goal:** Get 10 customer conversations

**Tasks:**
- [ ] Automated health monitoring (heartbeat)
- [ ] Bug fixes from demos (sub-agents)
- [ ] Add requested features (small, sub-agents)

**Token Budget:** 20k (mostly maintenance)

---

### Week 4: Optimize or Pivot
**Goal:** Decide next move based on traction

**Tasks:**
- [ ] If traction: plan Hetzner migration
- [ ] If slow: improve landing page, outreach
- [ ] Technical debt cleanup (sub-agents)

**Token Budget:** 30k

---

## 🔧 Immediate Actions (Next 24 Hours)

### 1. Deploy to Railway (Now)
```bash
# In Replit or local:
git push origin main

# In Railway dashboard:
1. Create new project
2. Connect GitHub repo: dillib/photonictag
3. Add PostgreSQL database
4. Set environment variables from .env.example
5. Deploy
```

### 2. Deploy Frontend to Vercel (15 min)
```bash
# In Vercel dashboard:
1. Import GitHub repo
2. Set build settings:
   - Framework: Vite
   - Build Command: npm run build
   - Output Directory: dist
3. Set environment variables
4. Deploy
```

### 3. Update DNS (5 min)
```
# In Cloudflare:
photonictag.com → Vercel
api.photonictag.com → Railway
```

---

## 📊 Token Usage Tracking

Create `.openclaw/token-usage.md`:
```markdown
# Token Usage Log

## Week of 2026-02-02
- Main agent: 15,000 tokens
- Sub-agent (refactor): 8,000 tokens
- Sub-agent (tests): 5,000 tokens
- Heartbeat checks: 2,000 tokens
**Total:** 30,000 tokens (~$0.30)

## Week of 2026-02-09
...
```

---

## 🎯 Success Metrics

### Technical
- [ ] Zero TypeScript errors
- [ ] <200ms API response time
- [ ] 99.9% uptime
- [ ] Token usage < 50k/week

### Business
- [ ] 10+ customer conversations
- [ ] 3+ pilot customers
- [ ] 1+ paying customer

---

## Questions?

**For token-efficient help:**
- Use sub-agents for isolated tasks
- Store decisions in .openclaw/ files
- Batch related questions
- Use heartbeats for monitoring

**For hosting questions:**
- Stick with Railway until $500 MRR
- Plan Hetzner migration at scale
- Keep it simple until validated

---

*Last updated by Dilba (OpenClaw) - 2026-02-02*
