# RoastMyResume 🔥

**AI-Powered Resume Roasting Platform** - Get brutally funny, ego-bruising resume roasts that secretly give real career advice.

![RoastMyResume](https://img.shields.io/badge/RoastMyResume-Live-orange)
![License](https://img.shields.io/badge/license-proprietary-red)

## 🎯 Product Vision

A SaaS platform where users upload their resume and get:
1. **Brutally Funny Roasts** - Like a comedy roast that secretly gives real career advice
2. **Glow-Up Reports** (Pro) - ATS-friendly rewrites, skill gap analysis, tailored suggestions
3. **Social Share Images** - Perfectly formatted for Instagram, Twitter/X, Threads, Reddit, LinkedIn
4. **Shareable Links** - JWT-based public pages (no server storage needed)

**Free Tier**: 1 roast/day with watermark  
**Pro Tier ($9.99/mo)**: Unlimited roasts, Glow-Up reports, watermark-free images

## 🧱 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Animations**: Framer Motion
- **Auth**: NextAuth.js v4 (Google OAuth only)
- **State**: Upstash Redis

### Backend
- **Framework**: Python FastAPI
- **Deployment**: Vercel Serverless Functions (Mangum adapter)
- **AI Model**: Qwen Max via OpenAI-compatible API
- **Payments**: Stripe Checkout + Webhooks
- **Database**: Upstash Redis (user tiers, rate limiting only)

### Key Features
- **Client-Side File Parsing**: pdf.js, mammoth.js (files never uploaded)
- **JWT Share Links**: Self-contained tokens, 7-day expiry
- **Client-Side Image Generation**: html-to-image library
- **No Traditional Database**: Redis only for minimal state

## 📁 Project Structure

```
roast-my-resume/
├── frontend/                 # Next.js application
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing page
│   │   ├── dashboard/       # Auth-protected upload & results
│   │   ├── share/[token]/   # Public share page
│   │   ├── api/             # Next.js API routes
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities, parsers, redis client
│   │   └── styles/          # Global CSS
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── backend/                  # Python FastAPI
│   ├── api/
│   │   ├── index.py         # Main FastAPI app
│   │   └── requirements.txt # Python dependencies
│   └── tests/               # Backend tests
├── .github/workflows/        # GitHub Actions CI/CD
├── vercel.json              # Vercel configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Upstash Redis account
- Google OAuth credentials
- Stripe account
- Qwen/DashScope API key

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/roast-my-resume.git
cd roast-my-resume
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

### 3. Backend Setup (Local Testing)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r api/requirements.txt
```

### 4. Environment Variables

Create `.env.local` in frontend directory:

```env
# AI
QWEN_API_KEY=your_qwen_api_key
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# Auth
NEXTAUTH_SECRET=generate_random_32_chars
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Redis
UPSTASH_REDIS_URL=https://your-redis.upstash.io
UPSTASH_REDIS_TOKEN=your_redis_token

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Share Links
SHARE_JWT_SECRET=generate_random_32_chars
```

## 🌐 Deployment

### Vercel Setup

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/roast-my-resume.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `frontend`
   - Add all environment variables

3. **Configure Rewrites**
   
   Create `vercel.json` in project root:
   ```json
   {
     "rewrites": [
       { "source": "/api/roast", "destination": "/backend/api/index" },
       { "source": "/api/create-share-link", "destination": "/backend/api/index" },
       { "source": "/api/stripe-webhook", "destination": "/backend/api/index" }
     ]
   }
   ```

4. **Deploy Python Backend**
   - Vercel automatically detects `api/` folder
   - Ensure `requirements.txt` is in `backend/api/`
   - Mangum handler exports as `handler`

### Stripe Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe-webhook`
3. Select events: `checkout.session.completed`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google`
6. Copy Client ID and Secret to environment variables

## 📖 Usage Flow

1. User visits landing page
2. Drags & drops resume (PDF/DOCX, max 5MB)
3. Text extracted client-side (never uploaded to server)
4. User selects intensity: Mild or Spicy
5. Signs in with Google (required for roast)
6. Frontend sends text to `/api/roast` endpoint
7. FastAPI validates session, checks rate limits
8. Calls Qwen AI with custom prompt
9. Returns roast JSON with sections
10. User sees results with tabs (Roast | Glow-Up | ATS Rewrite)
11. Can generate share images or create shareable link

## 💰 Monetization

### Free Tier
- 1 roast per day (rate limited via Redis)
- Watermarked share images
- Basic roast and glow-up tips

### Pro Tier ($9.99/month)
- Unlimited roasts
- ATS Rewrite section
- No watermarks on images
- Priority processing

### Stripe Integration
- Checkout session created via Next.js API route
- Webhook updates Redis user tier on payment
- Customer portal for subscription management

## 🔒 Security

- **No File Storage**: Resumes parsed client-side, text only sent to API
- **JWT Sessions**: NextAuth with secure HTTP-only cookies
- **Rate Limiting**: Redis-based daily limits for free users
- **Input Validation**: Pydantic models for all API requests
- **CORS**: Configured for production domains only
- **Environment Variables**: All secrets stored in Vercel env

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
source venv/bin/activate
pytest
```

## 📈 Scalability & Future Enhancements

### Current Architecture Benefits
- **Serverless**: Auto-scales with traffic
- **No Database Bottleneck**: Redis only for minimal state
- **Client-Side Processing**: Reduces server load
- **CDN Delivery**: Static assets served globally

### Future Enhancements
1. **Referral System**: Unique codes stored in Redis, free Pro month for referrals
2. **Hall of Fame**: Static page with best (fictitious) roasts
3. **Email Newsletter**: ConvertKit integration
4. **Team Plans**: Multiple users under one subscription
5. **Custom Branding**: White-label roasts for companies
6. **API Access**: Sell API access to third parties
7. **Mobile App**: React Native wrapper
8. **More AI Models**: GPT-4, Claude options
9. **Analytics Dashboard**: Track roast performance, popular industries
10. **Chrome Extension**: One-click roast from LinkedIn

### Performance Optimizations
- Implement edge caching for share pages
- Use Next.js ISR for static content
- Optimize PDF parsing with Web Workers
- Lazy load social share images
- Implement request queuing for high traffic

## 🤝 Contributing

This is a proprietary project. For licensing inquiries, contact: hello@roastmyresume.com

## 📄 License

© 2024 RoastMyResume. All rights reserved.

## 🆘 Support

- **Documentation**: This README
- **Issues**: GitHub Issues
- **Email**: support@roastmyresume.com
- **Twitter**: @RoastMyResume

---

**Built with 🔥 by the RoastMyResume team**
