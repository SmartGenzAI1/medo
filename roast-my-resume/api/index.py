from fastapi import FastAPI, Request, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel
from typing import Optional, Literal
import httpx
import os
import jwt
import time
import json
from datetime import datetime, timedelta
from upstash_redis import Redis
import stripe

# Initialize FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Redis
redis = Redis(
    url=os.getenv("UPSTASH_REDIS_URL"),
    token=os.getenv("UPSTASH_REDIS_TOKEN"),
)

# Stripe setup
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# Qwen API configuration
QWEN_API_KEY = os.getenv("QWEN_API_KEY")
QWEN_BASE_URL = os.getenv("QWEN_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")

# JWT Secret for share links
SHARE_JWT_SECRET = os.getenv("SHARE_JWT_SECRET", "fallback-secret-min-32-chars!")

# NextAuth secret for verifying sessions
NEXTAUTH_SECRET = os.getenv("NEXTAUTH_SECRET")


class RoastRequest(BaseModel):
    text: str
    intensity: Literal["mild", "spicy"]
    user_id: str
    tier: Literal["free", "pro"]


class ShareLinkRequest(BaseModel):
    roast: str
    glow_up: str
    ats_rewrite: Optional[str] = None
    intensity: str


def verify_nextauth_session(token: str) -> Optional[dict]:
    """Verify NextAuth JWT session token"""
    try:
        # NextAuth uses JWE by default, but we can try to decode if it's JWS
        # For simplicity, we'll extract the user info from the cookie
        # In production, you'd properly verify the JWT with the NextAuth secret
        payload = jwt.decode(token, NEXTAUTH_SECRET, algorithms=["HS256"])
        return payload
    except:
        # Fallback: try to get user from Redis based on token
        return None


async def call_qwen_api(prompt: str, system_message: str, timeout: int = 25) -> dict:
    """Call Qwen API with timeout"""
    headers = {
        "Authorization": f"Bearer {QWEN_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": "qwen-plus",
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 1000,
    }
    
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(
            f"{QWEN_BASE_URL}/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()


@app.post("/api/roast")
async def generate_roast(request: RoastRequest):
    """Generate AI roast for resume"""
    
    # Rate limiting for free users
    if request.tier == "free":
        today = datetime.now().strftime("%Y-%m-%d")
        usage_key = f"usage:{request.user_id}:{today}"
        usage_count = redis.get(usage_key) or 0
        
        if usage_count >= 1:
            raise HTTPException(
                status_code=429,
                detail="Daily limit reached for free users"
            )
        
        # Increment usage counter
        redis.set(usage_key, usage_count + 1, ex=86400)  # 24 hours
    
    # Build the prompt
    system_message = (
        "You are a world-class stand-up comedian who is also a brutal career expert. "
        "Roast the following resume with the intensity level specified. Be hilarious, specific, "
        "and even a little savage. After the roast, provide a separate section called 'Glow-Up Tips' "
        "with 5 actionable, serious career improvements. Keep the roast under 250 words and the tips under 200 words."
    )
    
    prompt = f"""Intensity: {request.intensity}

Resume Text:
{request.text[:15000]}  # Limit to 15k chars

Please format your response as JSON:
{{
  "roast": "your hilarious roast here",
  "glow_up": "your 5 actionable tips here"
  {', "ats_rewrite": "three rewritten bullet points"' if request.tier == "pro" else ""}
}}
"""
    
    if request.tier == "pro":
        prompt += "\n\nSince this is a Pro user, also include an 'ATS Rewrite' section that rewrites their first work experience bullet points in a more impactful way (exactly 3 bullets)."
    
    try:
        response = await call_qwen_api(prompt, system_message, timeout=25)
        
        # Parse the response
        content = response["choices"][0]["message"]["content"]
        
        # Try to extract JSON from the response
        try:
            # Find JSON in the response
            start_idx = content.find("{")
            end_idx = content.rfind("}") + 1
            if start_idx >= 0 and end_idx > start_idx:
                result = json.loads(content[start_idx:end_idx])
            else:
                result = json.loads(content)
        except:
            # Fallback parsing
            result = {
                "roast": content.split("Glow-Up Tips")[0].strip() if "Glow-Up Tips" in content else content,
                "glow_up": content.split("Glow-Up Tips")[1].strip() if "Glow-Up Tips" in content else "Review your resume for clarity and impact.",
            }
            if request.tier == "pro" and "ATS Rewrite" in content:
                result["ats_rewrite"] = content.split("ATS Rewrite")[1].strip()
        
        # Ensure required fields exist
        if "roast" not in result:
            result["roast"] = "Your resume is so bland, it makes plain oatmeal look spicy. But hey, at least you're consistent!"
        if "glow_up" not in result:
            result["glow_up"] = "1. Add quantifiable achievements\n2. Use action verbs\n3. Tailor to job descriptions\n4. Remove outdated info\n5. Proofread carefully"
        
        return result
        
    except httpx.TimeoutException:
        # Fallback joke roast on timeout
        return {
            "roast": "Your resume took so long to process, even the AI fell asleep. But seriously, consider simplifying those bullet points!",
            "glow_up": "1. Be concise\n2. Focus on achievements\n3. Use modern formatting\n4. Highlight key skills\n5. Get feedback",
        }
    except Exception as e:
        print(f"Roast generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate roast")


@app.post("/api/create-share-link")
async def create_share_link(request: ShareLinkRequest):
    """Create a JWT-based share link for roast results"""
    
    payload = {
        "roast": request.roast,
        "glow_up": request.glow_up,
        "ats_rewrite": request.ats_rewrite,
        "intensity": request.intensity,
        "created_at": int(time.time()),
    }
    
    # Create JWT token
    token = jwt.encode(
        payload,
        SHARE_JWT_SECRET,
        algorithm="HS256"
    )
    
    # Get base URL from environment or request
    base_url = os.getenv("NEXTAUTH_URL", "http://localhost:3000")
    share_url = f"{base_url}/share/{token}"
    
    return {"url": share_url}


@app.post("/api/stripe-webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle checkout.session.completed
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("client_reference_id")
        
        if user_id:
            # Update user tier to pro in Redis
            redis.set(f"user:{user_id}:tier", "pro")
    
    return Response(status_code=200)


# Mangum handler for Vercel
handler = Mangum(app)
