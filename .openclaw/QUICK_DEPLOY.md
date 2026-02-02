# Quick Deploy Guide
## Get PhotonicTag Live in 30 Minutes

---

## Option 1: Railway + Vercel (Recommended for Now)

### Step 1: Deploy Backend to Railway (10 min)

1. **Go to [railway.app](https://railway.app)**
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose: `dillib/photonictag`
   - Click "Deploy Now"

3. **Add PostgreSQL Database**
   - In Railway dashboard
   - Click "New" → "Database" → "PostgreSQL"
   - Wait for provisioning (~30 seconds)

4. **Set Environment Variables**
   Click "Variables" tab, add:
   ```bash
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   SESSION_SECRET=your-random-64-char-string-here
   MASTER_ADMIN_EMAILS=your-email@example.com
   ALLOWED_ORIGINS=https://photonictag.com,https://www.photonictag.com
   ```

5. **Generate Public URL**
   - Settings → Networking
   - Click "Generate Domain"
   - Copy URL (e.g., `photonictag-production.up.railway.app`)

6. **Push Database Schema**
   In Railway shell or local terminal:
   ```bash
   npm run db:push
   ```

---

### Step 2: Deploy Frontend to Vercel (10 min)

1. **Go to [vercel.com](https://vercel.com)**
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import `dillib/photonictag`

3. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Set Environment Variables**
   ```bash
   VITE_API_URL=https://your-railway-url.up.railway.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait ~2 minutes

6. **Get Production URL**
   - Copy the Vercel URL (e.g., `photonictag.vercel.app`)

---

### Step 3: Connect Custom Domain (10 min)

1. **In Vercel Dashboard**
   - Project Settings → Domains
   - Add: `photonictag.com`
   - Add: `www.photonictag.com`

2. **In Cloudflare DNS**
   Add these records:
   ```
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com
   Proxy: Enabled

   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   Proxy: Enabled

   Type: CNAME
   Name: api
   Target: your-railway-url.up.railway.app
   Proxy: Enabled
   ```

3. **Update API URL in Vercel**
   - Environment Variables
   - Change `VITE_API_URL` to: `https://api.photonictag.com`
   - Redeploy

---

### Step 4: Test Everything

```bash
# 1. Health check
curl https://api.photonictag.com/api/health
# Should return: {"status":"ok"}

# 2. Visit site
open https://photonictag.com

# 3. Test login
# Create account → should work

# 4. Test SAP Connector
# Go to /sap-connector → Sync Now → should import 100 products
```

---

## Option 2: Hetzner VPS (For Later, When Scaled)

### When to Use
- Monthly Railway cost > $20
- You have 5+ paying customers
- You need background jobs

### Setup (1 hour)

1. **Create Hetzner Account**
   - [hetzner.com](https://www.hetzner.com)
   - Add payment method

2. **Create VPS**
   - CX21 (4GB RAM, 2 vCPU) - $7/month
   - Location: Nuremberg (EU) or Ashburn (US)
   - Image: Ubuntu 22.04

3. **Initial Server Setup**
   ```bash
   # SSH into server
   ssh root@YOUR_SERVER_IP

   # Update system
   apt update && apt upgrade -y

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Install Docker Compose
   apt install docker-compose -y

   # Install Caddy (for HTTPS)
   apt install -y debian-keyring debian-archive-keyring apt-transport-https
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
   apt update
   apt install caddy
   ```

4. **Clone Repo & Deploy**
   ```bash
   # Clone repo
   cd /opt
   git clone https://github.com/dillib/photonictag.git
   cd photonictag

   # Create .env file
   cp .env.example .env
   nano .env
   # Fill in all variables

   # Start with Docker Compose
   docker-compose up -d

   # Check logs
   docker-compose logs -f
   ```

5. **Configure Caddy (HTTPS)**
   ```bash
   nano /etc/caddy/Caddyfile
   ```

   Add:
   ```
   photonictag.com {
       reverse_proxy localhost:5000
   }

   api.photonictag.com {
       reverse_proxy localhost:5000
   }
   ```

   ```bash
   systemctl restart caddy
   ```

6. **Point DNS to Hetzner**
   In Cloudflare:
   ```
   Type: A
   Name: @
   Value: YOUR_HETZNER_IP
   Proxy: Disabled (let Caddy handle SSL)

   Type: A
   Name: api
   Value: YOUR_HETZNER_IP
   Proxy: Disabled
   ```

---

## Monitoring & Maintenance

### Railway/Vercel (Automated)
- Railway auto-deploys on `git push origin main`
- Vercel auto-deploys on `git push origin main`
- Check Railway dashboard for logs/metrics

### Hetzner (Manual)
```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Pull latest code
cd /opt/photonictag
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

---

## Cost Comparison

### Railway + Vercel (Current)
| Service | Cost |
|---------|------|
| Vercel Frontend | $0 |
| Railway Backend | $5/mo |
| Railway DB | $5/mo |
| **Total** | **$10/mo** |

### Hetzner VPS (Future)
| Service | Cost |
|---------|------|
| Hetzner CX21 | $7/mo |
| Domain (Cloudflare) | $0 |
| Backups (optional) | $2/mo |
| **Total** | **$9/mo** |

**Recommendation:**
- Use Railway until you hit $500 MRR
- Then migrate to Hetzner for cost savings

---

## Emergency Rollback

### Railway
```bash
# In Railway dashboard:
1. Go to Deployments
2. Click "..." on previous working deployment
3. Click "Redeploy"
```

### Vercel
```bash
# In Vercel dashboard:
1. Go to Deployments
2. Find working deployment
3. Click "..." → "Promote to Production"
```

### Hetzner
```bash
ssh root@YOUR_SERVER_IP
cd /opt/photonictag

# Rollback git
git log --oneline  # Find good commit hash
git reset --hard <commit-hash>

# Restart
docker-compose down
docker-compose up -d --build
```

---

## Next Steps

After deploying:
1. ✅ Test all features
2. ✅ Set up monitoring (Railway has built-in)
3. ✅ Configure Calendly link in landing page
4. ✅ Start customer outreach
5. ✅ Update `.openclaw/progress.md` with deployment date

---

*Deploy fast, validate faster!*
