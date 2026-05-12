from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
from jose import jwt, JWTError
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']
STRIPE_API_KEY = os.environ['STRIPE_API_KEY']
JWT_SECRET = os.environ['JWT_SECRET']
ADMIN_EMAIL = os.environ['ADMIN_EMAIL']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
JWT_ALGO = "HS256"
JWT_EXP_HOURS = 24

# Donation packages (server-side, secured)
DONATION_PACKAGES = {
    "small": 10.0,
    "medium": 25.0,
    "large": 50.0,
    "champion": 100.0,
}

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)


# ---------- Models ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class BlogPostBase(BaseModel):
    slug: str
    title_fr: str
    title_en: str
    excerpt_fr: str
    excerpt_en: str
    content_fr: str
    content_en: str
    image_url: str
    author: str = "CENADEP"
    tags: List[str] = []


class BlogPost(BlogPostBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    published_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContactMessageIn(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


class ContactMessage(ContactMessageIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ChatRequest(BaseModel):
    session_id: str
    message: str
    lang: str = "fr"


class ChatResponse(BaseModel):
    reply: str


class DonationCheckoutRequest(BaseModel):
    package_id: Optional[str] = None
    custom_amount: Optional[float] = None
    donor_name: Optional[str] = None
    donor_email: Optional[EmailStr] = None
    origin_url: str


class DonationCheckoutResponse(BaseModel):
    url: str
    session_id: str


# ---------- Auth helpers ----------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())


def create_token(sub: str) -> str:
    payload = {
        "sub": sub,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXP_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def require_admin(creds: HTTPAuthorizationCredentials = Depends(security)):
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        email = payload.get("sub")
        if email != ADMIN_EMAIL:
            raise HTTPException(status_code=403, detail="Forbidden")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------- Routes: Health ----------
@api_router.get("/")
async def root():
    return {"message": "CENADEP API", "status": "ok"}


# ---------- Routes: Auth ----------
@api_router.post("/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    admin = await db.admins.find_one({"email": req.email}, {"_id": 0})
    if not admin or not verify_password(req.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenResponse(access_token=create_token(admin["email"]))


@api_router.get("/auth/me")
async def me(email: str = Depends(require_admin)):
    return {"email": email}


# ---------- Routes: Blog ----------
@api_router.get("/blog", response_model=List[BlogPost])
async def list_posts():
    posts = await db.blog_posts.find({}, {"_id": 0}).sort("published_at", -1).to_list(100)
    for p in posts:
        if isinstance(p.get("published_at"), str):
            p["published_at"] = datetime.fromisoformat(p["published_at"])
    return posts


@api_router.get("/blog/{slug}", response_model=BlogPost)
async def get_post(slug: str):
    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if isinstance(post.get("published_at"), str):
        post["published_at"] = datetime.fromisoformat(post["published_at"])
    return post


@api_router.post("/admin/blog", response_model=BlogPost)
async def create_post(payload: BlogPostBase, _: str = Depends(require_admin)):
    exists = await db.blog_posts.find_one({"slug": payload.slug}, {"_id": 0})
    if exists:
        raise HTTPException(status_code=400, detail="Slug already exists")
    post = BlogPost(**payload.model_dump())
    doc = post.model_dump()
    doc["published_at"] = doc["published_at"].isoformat()
    await db.blog_posts.insert_one(doc)
    return post


@api_router.put("/admin/blog/{slug}", response_model=BlogPost)
async def update_post(slug: str, payload: BlogPostBase, _: str = Depends(require_admin)):
    existing = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    update_data = payload.model_dump()
    await db.blog_posts.update_one({"slug": slug}, {"$set": update_data})
    updated = await db.blog_posts.find_one({"slug": payload.slug}, {"_id": 0})
    if isinstance(updated.get("published_at"), str):
        updated["published_at"] = datetime.fromisoformat(updated["published_at"])
    return updated


@api_router.delete("/admin/blog/{slug}")
async def delete_post(slug: str, _: str = Depends(require_admin)):
    res = await db.blog_posts.delete_one({"slug": slug})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"deleted": True}


@api_router.get("/blog/{slug}/summary")
async def ai_summary(slug: str, lang: str = "fr"):
    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    content = post.get(f"content_{lang}", post.get("content_fr", ""))
    system_msg = (
        "Tu es un assistant qui résume des articles d'une ONG congolaise (CENADEP) en 3 phrases claires et engageantes."
        if lang == "fr"
        else "You are an assistant summarizing articles from a Congolese NGO (CENADEP) in 3 clear, engaging sentences."
    )
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"summary-{slug}-{lang}",
        system_message=system_msg,
    ).with_model("gemini", "gemini-3-flash-preview")
    reply = await chat.send_message(UserMessage(text=content[:4000]))
    return {"summary": reply}


# ---------- Routes: Contact ----------
@api_router.post("/contact", response_model=ContactMessage)
async def contact(payload: ContactMessageIn):
    msg = ContactMessage(**payload.model_dump())
    doc = msg.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.contact_messages.insert_one(doc)
    return msg


@api_router.get("/admin/contact", response_model=List[ContactMessage])
async def list_contacts(_: str = Depends(require_admin)):
    items = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for it in items:
        if isinstance(it.get("created_at"), str):
            it["created_at"] = datetime.fromisoformat(it["created_at"])
    return items


# ---------- Routes: Chatbot ----------
@api_router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    system_fr = (
        "Tu es l'assistant virtuel du CENADEP, ONG laïque et apolitique œuvrant en République Démocratique du Congo "
        "pour le développement participatif et la démocratie. Tu réponds avec chaleur, en français clair, en 2-4 phrases. "
        "Tu connais nos trois piliers: Terre & Communauté, Participation & Éveil, Rayonnement & Espoir. "
        "Tu peux orienter vers les pages: /a-propos, /programmes, /blog, /impact, /contact, /don."
    )
    system_en = (
        "You are the CENADEP virtual assistant, a secular non-partisan NGO in the Democratic Republic of Congo "
        "advancing participatory development and democracy. Answer warmly, in clear English, in 2-4 sentences. "
        "Our three pillars: Land & Community, Participation & Awakening, Radiance & Hope. "
        "You can direct visitors to: /a-propos, /programmes, /blog, /impact, /contact, /don."
    )
    system_msg = system_fr if req.lang == "fr" else system_en
    llm = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=req.session_id,
        system_message=system_msg,
    ).with_model("gemini", "gemini-3-flash-preview")
    reply = await llm.send_message(UserMessage(text=req.message))
    # Persist
    await db.chat_messages.insert_one({
        "session_id": req.session_id,
        "user": req.message,
        "assistant": reply,
        "lang": req.lang,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return ChatResponse(reply=reply)


# ---------- Routes: Donations ----------
@api_router.post("/donations/checkout", response_model=DonationCheckoutResponse)
async def donations_checkout(req: DonationCheckoutRequest, http_request: Request):
    # Determine amount server-side
    if req.package_id and req.package_id in DONATION_PACKAGES:
        amount = DONATION_PACKAGES[req.package_id]
        package_label = req.package_id
    elif req.custom_amount is not None and req.custom_amount >= 1.0:
        amount = float(round(req.custom_amount, 2))
        package_label = "custom"
    else:
        raise HTTPException(status_code=400, detail="Invalid donation package or amount")

    origin = req.origin_url.rstrip("/")
    success_url = f"{origin}/don/merci?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/don"

    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    metadata = {
        "purpose": "cenadep_donation",
        "package": package_label,
        "donor_name": req.donor_name or "",
        "donor_email": req.donor_email or "",
    }
    cs_req = CheckoutSessionRequest(
        amount=amount, currency="usd",
        success_url=success_url, cancel_url=cancel_url,
        metadata=metadata,
    )
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(cs_req)

    # Persist transaction
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "amount": amount,
        "currency": "usd",
        "package": package_label,
        "donor_name": req.donor_name,
        "donor_email": req.donor_email,
        "payment_status": "initiated",
        "status": "open",
        "metadata": metadata,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })

    return DonationCheckoutResponse(url=session.url, session_id=session.session_id)


@api_router.get("/donations/status/{session_id}")
async def donations_status(session_id: str, http_request: Request):
    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    status_obj: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)

    # Update record if payment_status changed and not already marked paid
    existing = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if existing and existing.get("payment_status") != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": status_obj.payment_status,
                "status": status_obj.status,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }}
        )

    return {
        "session_id": session_id,
        "payment_status": status_obj.payment_status,
        "status": status_obj.status,
        "amount_total": status_obj.amount_total,
        "currency": status_obj.currency,
    }


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    try:
        evt = await stripe_checkout.handle_webhook(body, sig)
        if evt.session_id:
            existing = await db.payment_transactions.find_one({"session_id": evt.session_id}, {"_id": 0})
            if existing and existing.get("payment_status") != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": evt.session_id},
                    {"$set": {
                        "payment_status": evt.payment_status,
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                    }},
                )
    except Exception as e:
        logging.exception("Stripe webhook error: %s", e)
    return {"received": True}


# ---------- Seeding ----------
SEED_POSTS = [
    {
        "slug": "construire-democratie-participative-rdc",
        "title_fr": "Construire la démocratie participative en RDC",
        "title_en": "Building participatory democracy in DRC",
        "excerpt_fr": "Trente ans après sa fondation, le CENADEP réaffirme sa mission d'éveil citoyen au cœur des communautés congolaises.",
        "excerpt_en": "Thirty years after its founding, CENADEP reaffirms its mission of civic awakening at the heart of Congolese communities.",
        "content_fr": "La démocratie participative ne s'impose pas, elle se cultive. Dans nos 26 provinces, le CENADEP accompagne des comités locaux de citoyens, des écoles de la gouvernance et des plateformes de redevabilité. Ce sont des milliers d'hommes et de femmes qui apprennent à dialoguer avec leurs élus, à comprendre les budgets publics, et à proposer des solutions concrètes aux défis de leur territoire. Ce travail discret bâtit la république, brique par brique, conversation par conversation. En 2026, nous lançons une nouvelle vague de formations dans le Kasaï et le Sud-Kivu.",
        "content_en": "Participatory democracy is not imposed; it is cultivated. Across our 26 provinces, CENADEP supports local citizen committees, governance schools, and accountability platforms. Thousands of women and men learn to dialogue with their elected officials, to understand public budgets, and to propose concrete solutions to local challenges. This quiet work builds the republic, brick by brick, conversation by conversation. In 2026, we launch a new wave of trainings in Kasaï and South Kivu.",
        "image_url": "https://images.unsplash.com/photo-1573167627769-e201a7ddf409?crop=entropy&cs=srgb&fm=jpg&w=1600&q=80",
        "tags": ["démocratie", "gouvernance", "RDC"],
    },
    {
        "slug": "agriculture-vivriere-femmes-leaders",
        "title_fr": "Quand les femmes nourrissent une nation",
        "title_en": "When women feed a nation",
        "excerpt_fr": "Au Kongo-Central, des coopératives féminines transforment l'agriculture vivrière et l'économie locale.",
        "excerpt_en": "In Kongo-Central, women-led cooperatives are transforming food agriculture and the local economy.",
        "content_fr": "À Mbanza-Ngungu, soixante coopératives féminines ont triplé leur rendement en deux ans grâce à un accompagnement participatif. Elles décident ensemble des cultures, des prix, et de la redistribution des bénéfices. Le CENADEP fournit la formation technique, le plaidoyer auprès des autorités, et le lien avec les marchés urbains. Le résultat: la sécurité alimentaire de 12 000 foyers et l'émergence d'une nouvelle génération de leaders communautaires.",
        "content_en": "In Mbanza-Ngungu, sixty women-led cooperatives tripled their yields in two years through participatory support. They decide together on crops, prices, and how to redistribute profits. CENADEP provides technical training, advocacy with authorities, and links to urban markets. The result: food security for 12,000 households and the rise of a new generation of community leaders.",
        "image_url": "https://images.unsplash.com/photo-1622182474215-e74d12074fcc?crop=entropy&cs=srgb&fm=jpg&w=1600&q=80",
        "tags": ["agriculture", "femmes", "économie"],
    },
    {
        "slug": "education-civique-jeunesse",
        "title_fr": "L'école de la citoyenneté pour la jeunesse congolaise",
        "title_en": "The school of citizenship for Congolese youth",
        "excerpt_fr": "Notre programme d'éducation civique touche plus de 40 000 jeunes chaque année dans les universités et lycées.",
        "excerpt_en": "Our civic education program reaches over 40,000 young people each year in universities and high schools.",
        "content_fr": "La jeunesse congolaise représente plus de 65% de la population. Lui transmettre les outils de la citoyenneté active n'est pas un luxe, c'est une nécessité. À travers nos clubs de débat, nos simulations parlementaires et nos formations au journalisme citoyen, nous formons une génération outillée pour exiger la transparence et bâtir des institutions solides.",
        "content_en": "Congolese youth account for over 65% of the population. Equipping them with the tools of active citizenship is not a luxury, it's a necessity. Through our debate clubs, parliamentary simulations and citizen journalism trainings, we forge a generation equipped to demand transparency and build strong institutions.",
        "image_url": "https://images.unsplash.com/photo-1744809482817-9a9d4fc280af?crop=entropy&cs=srgb&fm=jpg&w=1600&q=80",
        "tags": ["jeunesse", "éducation", "citoyenneté"],
    },
    {
        "slug": "transparence-budgets-locaux",
        "title_fr": "Transparence des budgets locaux: un combat citoyen",
        "title_en": "Local budget transparency: a citizens' fight",
        "excerpt_fr": "Depuis 2022, le CENADEP forme des observatoires budgétaires dans 8 entités territoriales décentralisées.",
        "excerpt_en": "Since 2022, CENADEP has trained budget watchdog groups in 8 decentralized territorial entities.",
        "content_fr": "Comprendre où va l'argent public est le premier pas vers la redevabilité. Nos observatoires budgétaires, composés de citoyens formés, analysent les comptes des communes, posent des questions en assemblée et publient des rapports accessibles à tous. Cette pratique change la culture politique, peu à peu, jusqu'à ce que la transparence devienne la norme.",
        "content_en": "Understanding where public money goes is the first step toward accountability. Our budget watchdog groups, composed of trained citizens, analyze municipal accounts, ask questions in assemblies, and publish reports accessible to all. This practice changes political culture, little by little, until transparency becomes the norm.",
        "image_url": "https://images.unsplash.com/photo-1713468515390-95e9af5cb3ab?crop=entropy&cs=srgb&fm=jpg&w=1600&q=80",
        "tags": ["transparence", "gouvernance"],
    },
    {
        "slug": "trois-piliers-rebranding-2026",
        "title_fr": "Notre nouvelle identité: trois piliers, une République",
        "title_en": "Our new identity: three pillars, one Republic",
        "excerpt_fr": "Découvrez les valeurs et le récit visuel derrière le rebranding 2026 du CENADEP.",
        "excerpt_en": "Discover the values and visual story behind CENADEP's 2026 rebrand.",
        "content_fr": "Le vert vital pour la croissance des communautés, le gris ancrage pour la stabilité de la terre congolaise, l'or espoir pour le rayonnement de la transparence. Trois couleurs, trois piliers, une seule promesse: cultiver la démocratie participative jusque dans le dernier village. Cette nouvelle identité s'incarne dans chaque interaction, chaque rapport, chaque dialogue communautaire.",
        "content_en": "Vital green for community growth, anchor gray for the stability of Congolese soil, hope gold for the radiance of transparency. Three colors, three pillars, one promise: to cultivate participatory democracy down to the last village. This new identity comes alive in every interaction, every report, every community dialogue.",
        "image_url": "https://images.unsplash.com/photo-1576769267415-9242c9cd9fa5?crop=entropy&cs=srgb&fm=jpg&w=1600&q=80",
        "tags": ["identité", "rebranding"],
    },
]


@app.on_event("startup")
async def startup_seed():
    # Seed admin
    admin = await db.admins.find_one({"email": ADMIN_EMAIL}, {"_id": 0})
    if not admin:
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logging.info("Seeded admin %s", ADMIN_EMAIL)
    # Seed posts
    for p in SEED_POSTS:
        existing = await db.blog_posts.find_one({"slug": p["slug"]}, {"_id": 0})
        if not existing:
            post = BlogPost(**p)
            doc = post.model_dump()
            doc["published_at"] = doc["published_at"].isoformat()
            await db.blog_posts.insert_one(doc)
    logging.info("Seed complete")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
