"""
RoastMyResume API - Backend service for AI-powered resume roasting
"""
from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel, Field
from typing import Optional, Literal
import httpx
import os
import jwt
import json
from datetime import datetime, timedelta
from upstash_redis import Redis
import stripe

# =============================================================================
# App Initialization
# =============================================================================

app = FastAPI(
    title="RoastMyResume API",
    description="AI-powered resume roasting service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# Configuration
# =============================================================================

class Settings:
    """Application settings loaded from environment variables"""
    QWEN_API_KEY: str = os.getenv("QWEN_API_KEY")
    QWEN_BASE_URL: str = os.getenv("QWEN_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")
    NEXTAUTH_SECRET: str = os.getenv("NEXTAUTH_SECRET")
    UPSTASH_REDIS_URL: str = os.getenv("UPSTASH_REDIS_URL")
    UPSTASH_REDIS_TOKEN: str = os.getenv("UPSTASH_REDIS_TOKEN")
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET")
    SHARE_JWT_SECRET: str = os.getenv("SHARE_JWT_SECRET", "fallback-secret-change-in-production")
    BASE_URL: str = os.getenv("NEXTAUTH_URL", "http://localhost:3000")

settings = Settings()

# Initialize Redis
redis: Optional[Redis] = None
if settings.UPSTASH_REDIS_URL and settings.UPSTASH_REDIS_TOKEN:
    redis = Redis(url=settings.UPSTASH_REDIS_URL, token=settings.UPSTASH_REDIS_TOKEN)

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

# =============================================================================
# Request/Response Models
# =============================================================================

class RoastRequest(BaseModel):
    """Request model for generating a roast"""
    text: str = Field(..., description="Resume text to roast", max_length=15000)
    intensity: Literal["mild", "spicy"] = Field(..., description="Roast intensity level")
    user_id: str = Field(..., description="User ID for rate limiting")
    tier: Literal["free", "pro"] = Field(..., description="User subscription tier")

class ShareLinkRequest(BaseModel):
    """Request model for creating a share link"""
    roast: str
    glow_up: str
    ats_rewrite: Optional[str] = None
    intensity: Literal["mild", "spicy"]

def verify_nextauth_session(cookie: str) -> Optional[dict]:
    """Verify NextAuth JWT session cookie"""
    if not cookie or not NEXTAUTH_SECRET:
        return None
    
    try:
        # Extract the session token from cookie
        for item in cookie.split(";"):
            if "next-auth.session-token" in item:
                token = item.split("=")[1].strip()
                payload = jwt.decode(token, NEXTAUTH_SECRET, algorithms=["HS256"])
                return payload
    except Exception as e:
        print(f"Session verification failed: {e}")
    
    return None

async def call_qwen_api(prompt: str, system_message: str, timeout: int = 25) -> dict:
    """Call Qwen API with timeout"""
    headers = {
        "Authorization": f"Bearer {QWEN_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "qwen-max",
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 1000
    }
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{QWEN_BASE_URL}/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Qwen API error: {e}")
        # Fallback roast
        return "Your resume is so unique, even ATS systems think it's abstract art. But hey, at least you're memorable! 🎨"

@app.post("/api/roast")
async def generate_roast(request: RoastRequest):
    """Generate AI roast for resume"""
    
    # Rate limiting for free users
    if request.tier == "free" and redis:
        today = datetime.now().strftime("%Y-%m-%d")
        key = f"usage:{request.user_id}:{today}"
        count = redis.get(key)
        
        if count and count >= 1:
            raise HTTPException(status_code=429, detail="Daily limit reached. Upgrade to Pro for unlimited roasts!")
        
        # Increment usage
        redis.set(key, (count or 0) + 1, ex=86400)  # 24 hours
    
    # Build system message
    system_message = f"""You are a world-class stand-up comedian who is also a brutal career expert. Roast the following resume with the intensity level {request.intensity}. Be hilarious, specific, and even a little savage. After the roast, provide a separate section called 'Glow-Up Tips' with 5 actionable, serious career improvements. Keep the roast under 250 words and the tips under 200 words."""
    
    if request.tier == "pro":
        system_message += " Additionally, provide a third section called 'ATS Rewrite' that rewrites the resume's first work experience bullet points in a more impactful way (3 bullets)."
    
    # Build user prompt
    prompt = f"Here's my resume:\n\n{request.text[:15000]}"  # Trim to max 15k chars
    
    # Call Qwen API
    response_text = await call_qwen_api(prompt, system_message)
    
    # Parse response into sections
    roast = ""
    glow_up = ""
    ats_rewrite = ""
    
    sections = response_text.split("\n\n")
    current_section = "roast"
    
    for section in sections:
        section_lower = section.lower()
        if "glow-up" in section_lower or "glow up" in section_lower:
            current_section = "glow_up"
            continue
        elif "ats rewrite" in section_lower or "ats optimization" in section_lower:
            current_section = "ats"
            continue
        
        if current_section == "roast":
            roast += section + "\n\n"
        elif current_section == "glow_up":
            glow_up += section + "\n\n"
        elif current_section == "ats":
            ats_rewrite += section + "\n\n"
    
    result = {
        "roast": roast.strip(),
        "glow_up": glow_up.strip() if glow_up.strip() else "Work on your skills, update your experience, quantify achievements, tailor for each job, and get certifications.",
    }
    
    if request.tier == "pro" and ats_rewrite.strip():
        result["ats_rewrite"] = ats_rewrite.strip()
    
    return result

@app.post("/api/create-share-link")
async def create_share_link(request: ShareLinkRequest):
    """Create JWT-based share link"""
    
    payload = {
        "roast": request.roast,
        "glow_up": request.glow_up,
        "ats_rewrite": request.ats_rewrite,
        "intensity": request.intensity,
        "created_at": int(datetime.now().timestamp())
    }
    
    # Create JWT token
    token = jwt.encode(
        payload,
        SHARE_JWT_SECRET,
        algorithm="HS256",
        expires_delta=timedelta(days=7)
    )
    
    share_url = f"{BASE_URL}/share/{token}"
    
    return {"url": share_url}

@app.post("/api/stripe-webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """Handle Stripe webhook events"""
    
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Stripe webhook secret not configured")
    
    body = await request.body()
    
    try:
        event = stripe.Webhook.construct_event(
            body, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle checkout.session.completed
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("client_reference_id")
        
        if user_id and redis:
            redis.set(f"user:{user_id}:tier", "pro")
    
    return {"status": "success"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

# Mangum handler for Vercel
handler = Mangum(app)
