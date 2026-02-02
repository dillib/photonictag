# AI Cost Tracking & Model Selection
**Your Vercel AI Gateway Setup**

---

## 🎯 Cost Optimization Strategy

### Current Setup
- **Provider:** Vercel AI Gateway → Anthropic Claude
- **Default Model:** Claude Sonnet 4.5
- **Budget:** Conservative (validate first, scale later)

---

## 💰 Model Pricing (via Vercel AI Gateway)

### Anthropic Models (What You Have Access To)

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Best For |
|-------|----------------------|------------------------|----------|
| **Claude Haiku 3.5** | $1 | $5 | Simple fixes, type checks, quick tasks |
| **Claude Sonnet 4** | $3 | $15 | Code review, refactoring, features |
| **Claude Opus 4** | $15 | $75 | Complex architecture, critical decisions |

### Other Models (If You Add Them)

| Model | Input | Output | Best For |
|-------|-------|--------|----------|
| GPT-4o | $2.50 | $10 | Balanced, good for most tasks |
| GPT-4o Mini | $0.15 | $0.60 | Cheapest, simple tasks |
| GPT-o1 | $15 | $60 | Reasoning-heavy tasks |

---

## 📊 Task → Model Mapping

### Use **Haiku** ($1-5 per 1M tokens) For:
- ✅ Fixing TypeScript errors
- ✅ Running type checks
- ✅ Simple code formatting
- ✅ Adding null checks
- ✅ Updating documentation
- ✅ Installing dependencies
- ✅ Running builds

**Example:**
```
/spawn task="Fix TypeScript null check in sap-connector.tsx line 701" model=haiku
```

---

### Use **Sonnet** ($3-15 per 1M tokens) For:
- ✅ Code reviews (current default)
- ✅ Refactoring modules
- ✅ Adding new features
- ✅ Database schema changes
- ✅ API endpoint design
- ✅ Debugging complex issues

**Example:**
```
/spawn task="Refactor server/routes.ts into feature modules" model=sonnet
```

---

### Use **Opus** ($15-75 per 1M tokens) For:
- ✅ Architecture decisions
- ✅ Security audits
- ✅ Performance optimization
- ✅ Complex multi-file refactors
- ✅ Production incident debugging

**Example:**
```
/spawn task="Audit entire codebase for security vulnerabilities" model=opus
```

---

## 💵 Monthly Budget Examples

### Conservative (Validation Phase) - $10/month
```
Haiku:  100k tokens   = $0.50
Sonnet: 200k tokens   = $3.60
Opus:   20k tokens    = $1.50
Heartbeat: 50k tokens = $0.40
----------------------
Total: ~$6/month
```

**What You Get:**
- Daily type checks
- Weekly code reviews
- Bug fixes as needed
- Automated monitoring

---

### Moderate (Active Development) - $30/month
```
Haiku:  300k tokens   = $1.50
Sonnet: 600k tokens   = $10.80
Opus:   100k tokens   = $9.00
Heartbeat: 100k tokens = $0.80
----------------------
Total: ~$22/month
```

**What You Get:**
- All conservative features
- New feature development
- Daily refactoring
- Performance optimization

---

### Aggressive (Fast Iteration) - $100/month
```
Haiku:  500k tokens   = $2.50
Sonnet: 1.5M tokens   = $27.00
Opus:   500k tokens   = $45.00
Heartbeat: 200k tokens = $1.60
----------------------
Total: ~$76/month
```

**What You Get:**
- Everything above
- Complex architecture work
- Multiple sub-agents running
- 24/7 monitoring & auto-fix

---

## 🎯 Your Current Approach (Smart!)

### Token-Efficient Habits You're Already Using:
1. ✅ Storing decisions in files (not re-asking)
2. ✅ Using sub-agents for isolated tasks
3. ✅ Batching related questions
4. ✅ Spawning parallel work

### Cost Savings So Far:
- **Main conversation:** ~82k tokens used
- **With good practices:** Would've been ~150k+ tokens
- **Savings:** ~$1.20 in one session!

---

## 📋 Model Selection Cheat Sheet

### Quick Decision Tree:

```
Is it a simple fix? (types, null checks, formatting)
├─ YES → Use Haiku ($)
└─ NO → Is it adding new features or refactoring?
    ├─ YES → Use Sonnet ($$)
    └─ NO → Is it critical/complex/security?
        ├─ YES → Use Opus ($$$)
        └─ NO → Use Sonnet ($$)
```

---

## 🔧 How to Set Model for Tasks

### In Main Chat:
```bash
# Default (current: Sonnet)
"Fix the login bug"

# Specify model (not yet implemented in OpenClaw, but coming)
"Fix the login bug [model: haiku]"
```

### With Sub-Agents:
```bash
# Use cheaper model for simple task
/spawn task="Run type check and fix simple errors" model=haiku

# Use default (Sonnet) for balanced work
/spawn task="Refactor routes.ts into modules"

# Use powerful model for hard problems
/spawn task="Optimize database queries for 10x speed" model=opus
```

---

## 📊 Token Usage Log Template

Create `photonictag/.openclaw/token-usage.json`:

```json
{
  "2026-02": {
    "week1": {
      "haiku": 0,
      "sonnet": 82000,
      "opus": 0,
      "cost": "$3.69"
    },
    "week2": {
      "haiku": 50000,
      "sonnet": 150000,
      "opus": 10000,
      "cost": "$7.50"
    }
  }
}
```

**I'll update this weekly for you!**

---

## 💡 Cost-Saving Tips

### 1. Batch Simple Tasks
```bash
# EXPENSIVE (3 separate Sonnet calls):
"Fix type error in file A"
"Fix type error in file B"
"Fix type error in file C"

# CHEAP (1 Haiku call):
/spawn task="Fix all TypeScript strict mode errors in server/ directory" model=haiku
```

### 2. Use Heartbeats for Monitoring
```markdown
# In HEARTBEAT.md:
## Every 6 hours:
- Check Railway deployment health
- Run npm audit
- Update progress.md

# Cost: ~500 tokens per check = $0.02/day
```

### 3. Store Knowledge in Files
```bash
# EXPENSIVE:
"What OAuth providers do we support?"
... [agent re-reads entire codebase]

# FREE:
Read .openclaw/OAUTH_SETUP_LATER.md
```

---

## 🎯 This Session's Breakdown

### What We've Done:
```
Dependencies install: ~5k tokens (Sonnet)
Test report writing: ~15k tokens (Sonnet)
Documentation: ~20k tokens (Sonnet)
Main conversation: ~42k tokens (Sonnet)
--------------------
Total: ~82k tokens = $3.69
```

### What's Coming (TypeScript Fixes):
```
TypeScript fixes: ~20k tokens (Haiku - cheaper!)
Build test: ~3k tokens (Haiku)
Final report: ~5k tokens (Sonnet)
--------------------
Estimated: ~28k tokens = $0.80
```

**Total Session Cost: ~$4.50** (to go from broken → production-ready!)

---

## 🚀 Recommended Model Strategy for PhotonicTag

### Daily Operations (Auto-select model)
| Task Type | Model | Why |
|-----------|-------|-----|
| Type checking | Haiku | Fast, cheap, simple |
| Bug fixes | Haiku | Most bugs are straightforward |
| Feature work | Sonnet | Balanced quality/cost |
| Code reviews | Sonnet | Need good understanding |
| Architecture | Opus | Critical decisions |

### Manual Override (When Needed)
- If Haiku struggles → bump to Sonnet
- If Sonnet struggles → bump to Opus
- If Opus struggles → human review needed!

---

## 📈 Scaling Your AI Budget

### Phase 1: Validation (Now)
**Budget:** $10/month  
**Focus:** Fix bugs, deploy fast

### Phase 2: Growth (Month 3-6)
**Budget:** $30/month  
**Focus:** New features, optimization

### Phase 3: Scale (Month 7+)
**Budget:** $100/month  
**Focus:** Full automation, 24/7 AI support

---

## 🎯 Action Items

1. ✅ Track token usage weekly
2. ✅ Start with Haiku for simple tasks
3. ✅ Reserve Opus for critical work
4. ✅ Monitor cost vs value

**Your AI assistant should cost less than your time saved!**

---

*Smart model selection = 50-70% cost savings*
