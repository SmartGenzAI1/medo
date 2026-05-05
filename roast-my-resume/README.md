# RoastMyResume 🔥

AI-powered resume roasting that destroys your ego while secretly improving your career.

## Features

- **Brutal AI Roasts**: Get hilariously savage feedback on your resume
- **Glow-Up Tips**: Actionable career advice hidden behind the comedy
- **ATS Optimization** (Pro): Resume rewrites optimized for Applicant Tracking Systems
- **Social Share Images**: Perfectly formatted images for Instagram, Twitter, LinkedIn, etc.
- **Shareable Links**: JWT-based links that work without a database
- **Rate Limiting**: Free users get 1 roast/day, Pro users get unlimited

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui, Framer Motion
- **Backend**: Python FastAPI (Vercel Serverless)
- **Auth**: NextAuth.js with Google OAuth
- **Database**: Upstash Redis (user tiers, rate limiting only)
- **AI**: Qwen Max via OpenAI-compatible API
- **Payments**: Stripe subscriptions
- **File Parsing**: Client-side only (pdf.js, mammoth.js)

## Quick Start

### 1. Install Dependencies

```bash
cd roast-my-resume
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `QWEN_API_KEY` - Your Qwen/DashScope API key
- `QWEN_BASE_URL` - Qwen API base URL
- `NEXTAUTH_SECRET` - Random 32+ character string
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `UPSTASH_REDIS_URL` - Upstash Redis URL
- `UPSTASH_REDIS_TOKEN` - Upstash Redis token
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `SHARE_JWT_SECRET` - Random 32+ character string

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
roast-my-resume/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── dashboard/page.tsx      # Main app (upload & results)
│   ├── share/[token]/page.tsx  # Public share page
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth handler
│   │   └── stripe/create-checkout/route.ts  # Stripe checkout
│   ├── components/
│   │   ├── FileUploader.tsx    # Drag-and-drop file upload
│   │   ├── RoastResult.tsx     # Results display with tabs
│   │   ├── SocialShareModal.tsx # Image generation modal
│   │   └── ui/                 # Shadcn/ui components
│   ├── lib/
│   │   ├── redis.ts            # Upstash Redis client
│   │   ├── jwt-utils.ts        # JWT helpers for share links
│   │   ├── pdf-parser.ts       # Client-side PDF parsing
│   │   ├── docx-parser.ts      # Client-side DOCX parsing
│   │   ├── auth.ts             # Auth helpers
│   │   └── utils.ts            # Utility functions
│   └── styles/globals.css      # Global styles
├── api/
│   ├── index.py                # FastAPI backend
│   └── requirements.txt        # Python dependencies
├── public/                     # Static assets
├── vercel.json                 # Vercel configuration
├── next.config.js              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
└── package.json
```

## Deployment

### Vercel Setup

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

### Python Backend

The FastAPI backend in `api/index.py` is automatically deployed as a Vercel serverless function via the Mangum adapter.

### Stripe Webhook

Set up your Stripe webhook endpoint to:
```
https://your-domain.com/api/stripe-webhook
```

Select these events:
- `checkout.session.completed`

## Usage Flow

1. User visits landing page
2. Drags & drops resume (PDF/DOCX)
3. Text extracted client-side (never uploaded)
4. User selects intensity (Mild/Spicy)
5. Signs in with Google (required for roast)
6. Frontend sends text to `/api/roast`
7. FastAPI calls Qwen AI, returns roast JSON
8. User sees roast with tabs (Roast | Glow-Up | ATS Rewrite)
9. Can generate share images or create shareable link

## Monetization

- **Free**: 1 roast/day, watermarked images
- **Pro ($9.99/mo)**: Unlimited roasts, ATS rewrites, no watermark

Stripe Checkout handles payments. Webhook updates Redis user tier.

## Rate Limiting

Free users limited to 1 roast per day via Redis key:
```
usage:{user_id}:{date}
```

Key expires after 24 hours.

## Share Links

Share links use JWT tokens containing the roast data:
- No database storage needed
- 7-day expiry
- Signed with `SHARE_JWT_SECRET`
- Decoded client-side on share page

## License

© 2024 RoastMyResume. All rights reserved.
