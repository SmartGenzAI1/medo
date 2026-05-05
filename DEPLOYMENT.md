# 🚀 RoastMyResume - Complete Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Backend Deployment (Vercel Python)](#backend-deployment-vercel-python)
5. [Stripe Configuration](#stripe-configuration)
6. [Google OAuth Setup](#google-oauth-setup)
7. [Upstash Redis Setup](#upstash-redis-setup)
8. [Qwen AI API Setup](#qwen-ai-api-setup)
9. [Testing & Verification](#testing--verification)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Accounts
- ✅ GitHub account
- ✅ Vercel account (free tier works)
- ✅ Stripe account
- ✅ Google Cloud Console account
- ✅ Upstash account (free tier available)
- ✅ DashScope/Qwen API account

### Required Tools
```bash
# Install Node.js 18+
node --version  # Should be v18 or higher

# Install Python 3.9+
python --version  # Should be 3.9 or higher

# Install Vercel CLI (optional but recommended)
npm install -g vercel
```

---

## Environment Setup

### 1. Clone Your Repository

```bash
git clone https://github.com/YOUR_USERNAME/roast-my-resume.git
cd roast-my-resume
```

### 2. Generate Secrets

```bash
# Generate NEXTAUTH_SECRET (32+ random characters)
openssl rand -base64 32

# Generate SHARE_JWT_SECRET (32+ random characters)
openssl rand -base64 32
```

### 3. Create .env.local File

Copy `.env.example` to `.env.local` in the `frontend` directory:

```bash
cp frontend/.env.example frontend/.env.local
```

Fill in all values (see [Environment Variables Reference](#environment-variables-reference))

---

## Frontend Deployment (Vercel)

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit - RoastMyResume"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - **Root Directory**: Set to `frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

3. **Add Environment Variables**
   
   In Vercel dashboard → Project Settings → Environment Variables, add:

   | Variable | Value | Environment |
   |----------|-------|-------------|
   | `QWEN_API_KEY` | Your Qwen API key | Production, Preview, Development |
   | `QWEN_BASE_URL` | `https://dashscope.aliyuncs.com/api/v1` | All |
   | `NEXTAUTH_SECRET` | Generated secret | All |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production |
   | `GOOGLE_CLIENT_ID` | From Google Cloud | All |
   | `GOOGLE_CLIENT_SECRET` | From Google Cloud | All |
   | `UPSTASH_REDIS_URL` | From Upstash | All |
   | `UPSTASH_REDIS_TOKEN` | From Upstash | All |
   | `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` | All |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | All |
   | `STRIPE_WEBHOOK_SECRET` | From Stripe CLI/Dashboard | All |
   | `SHARE_JWT_SECRET` | Generated secret | All |

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app is live!

### Option B: Deploy via CLI

```bash
cd frontend
vercel login
vercel --prod
```

---

## Backend Deployment (Vercel Python)

The Python FastAPI backend is automatically deployed as serverless functions.

### 1. Configure `vercel.json`

Already configured in the project root:

```json
{
  "rewrites": [
    { "source": "/api/roast", "destination": "/api/index" },
    { "source": "/api/create-share-link", "destination": "/api/index" },
    { "source": "/api/stripe-webhook", "destination": "/api/index" }
  ],
  "functions": {
    "api/*.py": {
      "runtime": "vercel-python@3.2.0"
    }
  }
}
```

### 2. Install Python Dependencies

```bash
cd backend/api
pip install -r requirements.txt
```

### 3. Test Locally

```bash
# From backend/api directory
python index.py
```

### 4. Deploy

The backend deploys automatically when you push to GitHub. Vercel detects the `api/` folder and deploys it as serverless functions.

---

## Stripe Configuration

### 1. Create Products & Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Click "Add product"
3. Create product:
   - **Name**: RoastMyResume Pro
   - **Description**: Unlimited roasts, ATS rewrites, watermark-free images
   - **Pricing**: Recurring, $9.99/month

4. Copy the **Price ID** (e.g., `price_1Abc2Def3Ghi4Jkl`)

### 2. Update Environment Variables

Add to Vercel:
```env
STRIPE_PRO_PRICE_ID=price_1Abc2Def3Ghi4Jkl
```

### 3. Configure Webhooks

#### Local Development

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# Or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

You'll get a webhook signing secret. Add it to `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

#### Production

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://your-app.vercel.app/api/stripe-webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing Secret** and add to Vercel environment variables

### 4. Test Payment Flow

```bash
# Use Stripe test cards
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

---

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "RoastMyResume"
3. Enable **Google+ API**

### 2. Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. **Application type**: Web application
4. **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://your-app.vercel.app` (production)
5. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-app.vercel.app/api/auth/callback/google`

6. Copy **Client ID** and **Client Secret** to environment variables

### 3. Configure Consent Screen

1. Go to "OAuth consent screen"
2. Fill in:
   - **App name**: RoastMyResume
   - **User support email**: Your email
   - **Developer contact**: Your email
3. Add scopes: `email`, `profile`, `openid`
4. Save and continue

---

## Upstash Redis Setup

### 1. Create Database

1. Go to [Upstash Console](https://console.upstash.io/)
2. Click "Create Database"
3. Choose:
   - **Region**: Closest to your users
   - **TLS**: Enabled
   - **Eviction**: No eviction (free tier is sufficient)

4. Copy credentials:
   - `UPSTASH_REDIS_URL`
   - `UPSTASH_REDIS_TOKEN`

### 2. Add to Environment Variables

Add both to Vercel environment variables.

### 3. Verify Connection

```bash
# Install Upstash CLI
npm install -g @upstash/cli

# Test connection
upstash redis list
```

---

## Qwen AI API Setup

### 1. Get API Key

1. Go to [DashScope Console](https://dashscope.console.aliyun.com/)
2. Sign up / Log in
3. Go to "API Keys"
4. Create new API key

### 2. Configure Base URL

```env
QWEN_BASE_URL=https://dashscope.aliyuncs.com/api/v1
QWEN_API_KEY=sk-xxxxxxxxxxxxx
```

### 3. Test API

```bash
curl https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation \
  -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen-max",
    "input": {
      "messages": [
        {"role": "user", "content": "Hello"}
      ]
    }
  }'
```

---

## Testing & Verification

### Pre-Launch Checklist

#### Frontend
- [ ] Landing page loads correctly
- [ ] File upload works (PDF & DOCX)
- [ ] Text extraction displays properly
- [ ] Google login works
- [ ] Roast generation completes
- [ ] Results display with tabs
- [ ] Share modal opens
- [ ] Image generation works for all platforms
- [ ] Download button works
- [ ] Copy to clipboard works
- [ ] Share links generate correctly
- [ ] Share page displays roast

#### Backend
- [ ] `/api/roast` endpoint responds
- [ ] Rate limiting works (free users: 1/day)
- [ ] Pro users bypass rate limit
- [ ] JWT share link generation works
- [ ] Stripe webhook receives events
- [ ] Redis updates on subscription

#### Authentication
- [ ] Google OAuth redirects correctly
- [ ] Session persists across pages
- [ ] User tier fetched from Redis
- [ ] Protected routes redirect to login

#### Payments
- [ ] Checkout session creates successfully
- [ ] Redirects to Stripe Checkout
- [ ] Test payment completes
- [ ] Redirects to success page
- [ ] Tier updates to "pro" in Redis
- [ ] Pro features unlock immediately

### Manual Testing Commands

```bash
# Test Redis connection
curl https://YOUR_REGION.upstash.io/redis/ping \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test roast endpoint (requires auth cookie)
curl -X POST https://your-app.vercel.app/api/roast \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"text":"Test resume","intensity":"spicy"}'

# Test share link creation
curl -X POST https://your-app.vercel.app/api/create-share-link \
  -H "Content-Type: application/json" \
  -d '{"roast":"Test roast","glowUp":"Test tips"}'
```

---

## Monitoring & Maintenance

### Logging

#### Vercel Logs
```bash
vercel logs your-app.vercel.app
```

#### Real-time Logs
```bash
vercel logs --follow your-app.vercel.app
```

### Error Tracking

Consider adding:
- **Sentry**: For error tracking
- **Logtail**: For log aggregation
- **Uptime Robot**: For uptime monitoring

### Performance Optimization

1. **Enable Vercel Analytics**
   - Go to Project → Analytics → Enable

2. **Configure Caching**
   - Add cache headers to API responses
   - Use `stale-while-revalidate` for static content

3. **Image Optimization**
   - Already using Next.js Image component
   - Consider CDN for generated images if needed

### Scaling Considerations

#### Current Architecture (Serverless)
- ✅ Auto-scales with traffic
- ✅ No server management
- ✅ Pay-per-use pricing
- ⚠️ Cold starts (~1-2 seconds)
- ⚠️ 10-second timeout limit (adjusted to 25s for AI)

#### When to Upgrade
- **10k+ daily users**: Consider dedicated Redis
- **100k+ daily users**: Add CDN layer
- **1M+ monthly requests**: Consider dedicated backend servers

### Cost Estimation (Free Tier Limits)

| Service | Free Tier | Paid Tier Starts At |
|---------|-----------|---------------------|
| Vercel | 100GB bandwidth/mo | $20/mo |
| Upstash Redis | 10k commands/day | $15/mo |
| Stripe | 2.9% + 30¢ per transaction | Same |
| Qwen AI | Varies by usage | Pay-per-token |

**Estimated Monthly Cost (0-1000 users)**: $0-50
**Estimated Monthly Cost (10k users)**: $100-300

---

## Troubleshooting

### Common Issues

#### 1. "Module not found" in Python backend
```bash
# Ensure requirements.txt is in api/ folder
# Redeploy after adding missing packages
vercel --prod
```

#### 2. NextAuth callback URL mismatch
```env
# Ensure NEXTAUTH_URL matches your domain
NEXTAUTH_URL=https://your-app.vercel.app
```

#### 3. Stripe webhook signature verification fails
```bash
# Regenerate webhook secret
stripe listen --forward-to localhost:3000/api/stripe-webhook
# Copy new secret to .env.local
```

#### 4. Redis connection timeout
```bash
# Check Upstash credentials
# Ensure TLS is enabled in Upstash console
# Verify region matches your deployment
```

#### 5. AI timeout errors
```python
# Increase timeout in api/index.py
# Currently set to 25 seconds
# Consider using streaming response for longer roasts
```

---

## Security Best Practices

### Environment Variables
- ✅ Never commit `.env.local` to Git
- ✅ Rotate secrets every 90 days
- ✅ Use different keys for dev/staging/prod

### API Security
- ✅ JWT validation on all protected routes
- ✅ CORS configured for production domain only
- ✅ Rate limiting enabled
- ✅ Input validation with Pydantic

### Data Privacy
- ✅ Files parsed client-side (never uploaded)
- ✅ No resume text stored in database
- ✅ Share links expire after 7 days
- ✅ GDPR compliant (no personal data storage)

---

## Support & Resources

### Documentation Links
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Python Runtime](https://vercel.com/docs/runtimes#official-runtimes/python)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Upstash Redis Docs](https://upstash.com/docs/redis)
- [Stripe API Docs](https://stripe.com/docs/api)

### Community
- GitHub Issues: Report bugs
- Discord: Join Vercel community
- Twitter: @RoastMyResume

---

## Post-Launch Checklist

- [ ] Submit to Product Hunt
- [ ] Share on Reddit (r/SideProject, r/webdev)
- [ ] Post on Twitter/X with demo video
- [ ] Write blog post on Dev.to/Medium
- [ ] Add to GitHub trending (star campaign)
- [ ] Collect user feedback
- [ ] Monitor error rates
- [ ] Track conversion metrics
- [ ] Plan feature roadmap

---

**🎉 Congratulations! Your RoastMyResume platform is now live and ready to roast resumes at scale!**

For questions or issues, check the troubleshooting section or open a GitHub issue.
