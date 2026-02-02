# How to Use OpenClaw Agents Efficiently
## Save Tokens, Get More Done

---

## 🎯 Token Economics

### Current Setup
- **Model:** Claude Sonnet 4.5 (via Vercel AI Gateway)
- **Input Cost:** ~$3 per 1M tokens
- **Output Cost:** ~$15 per 1M tokens
- **Your Budget:** Conservative usage

### Token Costs Examples
| Task | Tokens | Cost |
|------|--------|------|
| "Fix this bug" (simple) | ~2,000 | $0.03 |
| "Refactor routes.ts" (medium) | ~15,000 | $0.20 |
| "Review entire codebase" (large) | ~100,000 | $1.50 |
| Heartbeat check (automated) | ~500 | $0.01 |
| Sub-agent task (isolated) | ~5,000 | $0.08 |

### Monthly Budget Example
- **Conservative:** 200k tokens/month = ~$6
- **Moderate:** 500k tokens/month = ~$15  
- **Active:** 1M tokens/month = ~$30

---

## ✅ Efficient Agent Usage (DO THIS)

### 1. Use Sub-Agents for Isolated Tasks

**Why:** Keeps main context clean, runs only when needed.

**Example:**
```
# BAD (in main chat):
"Refactor server/routes.ts into modules"
... [agent reads all files, uses 20k tokens]

# GOOD (spawn sub-agent):
/spawn task="Refactor server/routes.ts into feature modules in routes/ directory. Follow TypeScript strict mode." cleanup=keep
... [uses 8k tokens, keeps main context clean]
```

**When to Spawn:**
- ✅ Writing tests (isolated)
- ✅ Refactoring code (focused)
- ✅ Building new features (self-contained)
- ✅ Fixing specific bugs
- ✅ Writing documentation

---

### 2. Batch Related Questions

**Why:** One conversation is cheaper than multiple.

**Example:**
```
# BAD (3 separate messages):
"Fix the TypeScript error in routes.ts"
... [wait for response]
"Now fix the one in storage.ts"  
... [wait for response]
"Now run type check"

# GOOD (one message):
"Fix all TypeScript strict mode errors in server/ directory, then run npm run check and report results"
... [uses 1 context load instead of 3]
```

---

### 3. Use Memory Files Instead of Conversations

**Why:** Files are free to read, conversations cost tokens each time.

**Example:**
```
# BAD:
"What did we decide about the database schema last week?"
... [agent re-reads entire conversation history]

# GOOD:
# Store decision in file first:
"Add to .openclaw/decisions.md: Database schema uses Drizzle ORM with PostgreSQL. Product table includes carbon_footprint and repairability_score fields."

# Later, agent reads file (cheap):
"Review .openclaw/decisions.md and check if current schema matches"
```

**What to Store in Files:**
- `.openclaw/decisions.md` - Architecture decisions
- `.openclaw/known-issues.md` - Bugs and workarounds
- `.openclaw/progress.md` - Completed features
- `.openclaw/roadmap.md` - Upcoming work

---

### 4. Use Heartbeats for Monitoring

**Why:** Automated checks run in background, no manual asking.

**Setup in `.openclaw/HEARTBEAT.md`:**
```markdown
# Heartbeat Tasks

## Every 6 hours:
- Check if Railway deployment is healthy (call /api/health)
- If DOWN: notify immediately

## Every 24 hours:  
- Run npm audit
- If critical vulnerabilities: create issue

## Every Monday:
- Check for outdated dependencies
- Update .openclaw/progress.md with deployment status
```

**Then forget about it!** Agent checks automatically.

---

### 5. Be Specific, Avoid Vagueness

**Why:** Vague questions waste tokens on clarification.

**Example:**
```
# BAD:
"Make the app better"
... [agent asks 10 questions to clarify]

# GOOD:
"Add loading spinner to SAP Sync button. Show spinner when onClick fires, hide when sync completes or errors. Use Lucide loader-2 icon."
... [agent executes immediately]
```

---

## ❌ Inefficient Agent Usage (AVOID THIS)

### 1. ❌ Asking Agent to "Check" Things You Can Check
```
# BAD:
"Is the site live?"
"What's in the database?"
"Did the deploy work?"

# GOOD:
"Deploy latest changes to Railway and report final status"
```

### 2. ❌ Re-asking for Information Already in Files
```
# BAD:
"What features are done?"
... [agent reads entire codebase]

# GOOD:
# Update progress.md regularly:
"Update .openclaw/progress.md: Completed SAP connector, deployed to Railway"

# Then later:
"Review .openclaw/progress.md"
```

### 3. ❌ Using Main Agent for Simple Tasks
```
# BAD:
"Write a test for the login endpoint"
... [uses main context]

# GOOD:
/spawn task="Write vitest test for POST /api/auth/login endpoint. Test success and invalid credentials cases."
```

### 4. ❌ Asking Open-Ended Questions
```
# BAD:
"Tell me everything about the codebase"
... [burns 50k tokens]

# GOOD:
"Create .openclaw/architecture.md documenting: tech stack, folder structure, key services, and API endpoints"
... [one-time cost, reusable]
```

---

## 📋 Common Tasks (Best Practices)

### Deploying to Railway
```
# Efficient:
/spawn task="Deploy photonictag to Railway. Update .env with production values from .env.example. Run db:push. Test /api/health endpoint. Document deployment in .openclaw/progress.md" cleanup=keep
```

### Fixing Bugs
```
# Efficient:
"Bug: SAP sync button doesn't show loading state. Fix in client/src/pages/sap-connector.tsx. Add isLoading state, show Lucide loader-2 icon when true."
```

### Adding Features
```
# Efficient:
/spawn task="Add email notification feature. Create server/services/email-service.ts using Resend. Add POST /api/leads/:id/send-email endpoint. Update lead status on send. Add button to leads dashboard." model=sonnet cleanup=keep
```

### Code Review
```
# Efficient:
/spawn task="Review server/routes.ts for TypeScript strict mode compliance, auth middleware on all endpoints, and error handling. Create list of issues in .openclaw/code-review.md" cleanup=keep
```

### Weekly Maintenance
```
# Set up in HEARTBEAT.md (automated):
## Every Monday 9am:
- Run npm audit
- Check Railway deployment health  
- Update .openclaw/progress.md
- Report only if issues found
```

---

## 🚀 Agent Workflow Example (Real Scenario)

### Scenario: Add Calendly Integration

#### ❌ Inefficient Way (60k tokens)
```
User: "How do I add Calendly?"
Agent: [explains Calendly setup - 5k tokens]

User: "Where should I put the link?"
Agent: [explains component structure - 8k tokens]

User: "Show me the code"
Agent: [generates code - 10k tokens]

User: "Actually, add it to the pricing page too"
Agent: [reads entire codebase again - 15k tokens]

User: "Test if it works"
Agent: [can't test, suggests steps - 3k tokens]

User: "Okay what next?"
Agent: [explains deployment - 5k tokens]

Total: ~46k tokens + back-and-forth
```

#### ✅ Efficient Way (8k tokens)
```
User: "Add 'Book a Demo' button linking to https://calendly.com/yourname/demo on these pages: landing.tsx (hero section), pricing.tsx (top of page), contact.tsx (form success). Use Button variant='default' from components/ui. After done, update .openclaw/progress.md."

[Spawn sub-agent, 8k tokens, task complete]
```

**Savings: 38k tokens (~$0.50)**

---

## 📊 Token Usage Tracking

### Create `.openclaw/token-log.md`:
```markdown
# Token Usage Log

## 2026-02-02
| Task | Method | Tokens | Cost |
|------|--------|--------|------|
| Deploy to Railway | Sub-agent | 12k | $0.18 |
| Fix TS errors | Main | 8k | $0.12 |
| Heartbeat (3 checks) | Auto | 1.5k | $0.02 |
**Daily Total:** 21.5k tokens ($0.32)

## 2026-02-03
...

## Weekly Summary
**Week 1:** 85k tokens ($1.27)
**Week 2:** ...
```

---

## 🎯 Your Token Budget Strategy

### Phase 1: Validation (Now - 3 months)
**Budget:** 200k tokens/month (~$6)

**Use For:**
- Deployment setup (one-time: 30k)
- Bug fixes (ongoing: 40k/month)
- Small features (ongoing: 80k/month)
- Heartbeat monitoring (automated: 20k/month)
- Weekly reviews (4x: 30k/month)

### Phase 2: Growth (Month 4-6)
**Budget:** 500k tokens/month (~$15)

**Use For:**
- Customer-requested features
- Performance optimization
- Testing & QA automation
- Documentation updates

### Phase 3: Scale (Month 7+)
**Budget:** 1M tokens/month (~$30)

**Use For:**
- Complex refactoring
- AI-powered features
- Multi-agent workflows
- 24/7 monitoring

---

## 💡 Pro Tips

### 1. Start Conversations with Context
```
# GOOD:
"In photonictag project: Add Stripe checkout to pricing page"

# BETTER:
"Photonictag pricing page (client/src/pages/pricing.tsx): Add Stripe checkout for 'Pro Plan' card. Use @stripe/stripe-js. Redirect to /api/checkout/create-session on click."
```

### 2. End with Clear Deliverables
```
# GOOD:
"Fix the login bug"

# BETTER:
"Fix login bug in server/auth.ts. After fixing, run type check, test locally, commit with message 'fix: resolve login redirect issue', and update .openclaw/known-issues.md to mark resolved."
```

### 3. Use `/spawn` for Parallel Work
```
# Run these simultaneously:
/spawn task="Write tests for auth endpoints"
/spawn task="Write tests for product endpoints"  
/spawn task="Write tests for SAP sync service"

# Each runs in isolation, no context conflicts
```

---

## 🤖 Agent Commands Quick Reference

```bash
# Spawn isolated sub-agent
/spawn task="Your specific task here" cleanup=keep

# Check agent status
/status

# List active sessions
/sessions

# Force agent to write memory
"Update .openclaw/decisions.md with: ..."

# Set up automated monitoring
# Edit .openclaw/HEARTBEAT.md manually or:
"Add to HEARTBEAT.md: Check /api/health every 6 hours"
```

---

## 📝 Summary: The Golden Rules

1. ✅ **Spawn sub-agents** for isolated tasks
2. ✅ **Batch related questions** together  
3. ✅ **Store decisions in files**, not conversations
4. ✅ **Use heartbeats** for monitoring
5. ✅ **Be specific** in requests
6. ❌ **Don't** ask agent to check things you can check
7. ❌ **Don't** re-ask for information in files
8. ❌ **Don't** use main agent for simple tasks

**Follow these rules → Save 50-70% on tokens!**

---

*Work smarter, not harder. Your AI agent is a tool, use it wisely.*
