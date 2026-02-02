# OAuth Setup Guide (For Later)
**Status:** Optional - Not needed for validation  
**When to set up:** After first 3-5 demo calls

---

## Why Skip OAuth for Now?

**Validation Build Strategy:**
- ✅ Local auth works fine (email/password)
- ✅ Faster to deploy without OAuth
- ✅ Saves setup time
- ✅ Can add SSO later when customers request it

**When to Add:**
- Enterprise customers ask for SSO
- You want to reduce signup friction
- Managing 20+ users manually becomes tedious

---

## Google OAuth Setup (When Ready)

### Step 1: Create Google Cloud Project (15 min)

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**
   - Sign in with your Google account

2. **Create New Project**
   - Click "Select a project" → "New Project"
   - Name: "PhotonicTag"
   - Click "Create"

3. **Enable Google+ API**
   - In the project dashboard
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "PhotonicTag Production"
   
   **Authorized redirect URIs:**
   ```
   https://photonictag.com/api/auth/google/callback
   https://api.photonictag.com/auth/google/callback
   http://localhost:5000/api/auth/google/callback (for testing)
   ```

5. **Copy Credentials**
   - You'll get a **Client ID** and **Client Secret**
   - Keep these safe!

---

### Step 2: Add to Railway Environment

In Railway dashboard:
```bash
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

---

### Step 3: Install Dependencies

```bash
npm install passport-google-oauth20
npm install -D @types/passport-google-oauth20
```

---

### Step 4: Test

1. Go to https://photonictag.com
2. Click "Sign in with Google"
3. Should redirect to Google
4. After login, redirects back to dashboard

---

## Microsoft OAuth Setup (When Ready)

### Step 1: Create Azure AD App (15 min)

1. **Go to [Azure Portal](https://portal.azure.com)**
   - Sign in with Microsoft account

2. **Register App**
   - Navigate to "Azure Active Directory"
   - Click "App registrations" → "New registration"
   - Name: "PhotonicTag"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   
   **Redirect URI:**
   ```
   Web: https://photonictag.com/api/auth/microsoft/callback
   ```

3. **Create Client Secret**
   - In your app registration
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Description: "Production"
   - Expires: 24 months
   - Copy the **Value** (not the ID!)

4. **Copy Application ID**
   - Go to "Overview"
   - Copy the **Application (client) ID**

---

### Step 2: Add to Railway Environment

```bash
MICROSOFT_CLIENT_ID=your-application-id-here
MICROSOFT_CLIENT_SECRET=your-client-secret-here
```

---

### Step 3: Install Dependencies

```bash
npm install passport-microsoft
npm install -D @types/passport-microsoft
```

---

## OAuth Cost Comparison

| Provider | Setup Time | Enterprise Appeal | Cost |
|----------|------------|-------------------|------|
| Local Auth | ✅ 0 min | Low | $0 |
| Google OAuth | 15 min | Medium | $0 |
| Microsoft OAuth | 15 min | High (B2B) | $0 |
| SAML/LDAP | 2-4 hours | Very High | Complex |

---

## Recommended Timeline

### Now (Validation Phase)
- ✅ Local auth only (email/password)
- Focus on product demos
- Get first 3-5 customers

### Month 2-3 (After Validation)
- Add Google OAuth (most requested)
- Nice-to-have for consumer ease

### Month 4+ (Enterprise Sales)
- Add Microsoft OAuth (B2B customers want this)
- Consider SAML for Fortune 500

---

## Testing OAuth Locally

### Local Development URLs
```bash
# Add to .env
APP_URL=http://localhost:5000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Add localhost to OAuth redirect URIs
- Google Console: Add `http://localhost:5000/api/auth/google/callback`
- Azure Portal: Add `http://localhost:5000/api/auth/microsoft/callback`

---

## Current Auth Status

**What Works Today:**
- ✅ Email/password signup
- ✅ Email/password login
- ✅ Session management
- ✅ Password hashing (bcryptjs)
- ✅ Admin role system

**What's Waiting for OAuth:**
- ⏳ "Sign in with Google" button (commented out or disabled)
- ⏳ "Sign in with Microsoft" button (commented out or disabled)

**This is fine for validation!** Most B2B SaaS starts with email auth.

---

## When Customers Ask

**"Do you support Google/Microsoft login?"**

Response options:

**Option A (Honest):**
> "Not yet, but we can add it this week if it's a blocker for you. We're focused on validating the core DPP features first."

**Option B (Delay):**
> "Yes, we're adding SSO next sprint. For now, email/password login gives you full access to all features."

**Option C (Enterprise Sell):**
> "We support SSO for enterprise plans. Would you like to discuss our Enterprise tier with SAML/LDAP integration?"

---

## I'll Guide You When Ready

When you're ready to add OAuth:
1. Tell me which provider (Google, Microsoft, or both)
2. I'll walk you through the setup step-by-step
3. We'll test locally first
4. Then deploy to production

**For now: focus on product validation without OAuth!** 🚀

---

*OAuth is a nice-to-have, not a must-have for early customers.*
