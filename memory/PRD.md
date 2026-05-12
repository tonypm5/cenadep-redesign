# CENADEP — Product Requirements Document

## Original problem statement
Build a multi-page CENADEP NGO website (FR/EN bilingual) cloning the arcads.ai aesthetic, with GSAP scrollytelling, blog, and rebrand 2026 branding (Vert Vital #1A8F4D, Or Espoir #F1C40F, Gris Ancrage, Blanc Pureté; Montserrat + Open Sans).

## Architecture
- Backend: FastAPI + MongoDB (motor), JWT auth, Stripe via emergentintegrations, Gemini 3 Flash via emergentintegrations
- Frontend: React 19 + React Router, Tailwind CSS, GSAP + ScrollTrigger, Shadcn/UI primitives, sonner toasts, lucide-react icons
- Multi-page routes: /, /a-propos, /programmes, /blog, /blog/:slug, /impact, /actualites, /contact, /don, /don/merci, /admin/login, /admin/blog

## Personas
- Visitor (donor/citizen/student): explores mission, reads blog, donates
- Journalist / partner: looks for reports and contact info
- Admin (CENADEP editorial team): manages blog content via CMS

## Core requirements (done)
- Hero scrollytelling (pin + masked image expand)
- 3 piliers (bento grid)
- Animated impact counters
- Horizontal scroll Programmes
- Blog: list, detail, AI summary (Gemini 3)
- Contact form persisted in Mongo
- Stripe one-time donations (10/25/50/100 + custom) + polling success page with graceful fallback
- Admin: JWT login + blog CRUD
- Floating Gemini 3 chatbot (bilingual)
- FR/EN language toggle via context, persisted localStorage
- Sticky navbar + dark footer

## Backlog (future)
- P1: Email notifications on contact form & donation receipts (Resend)
- P1: Server-rendered SEO meta tags / sitemap
- P1: Newsletter signup
- P2: Recurring donations
- P2: Multi-author roles + role-based admin
- P2: Rich text editor in admin (TipTap/Lexical)
- P2: Reports PDF upload + object storage

## Done — 2026-02
- Initial MVP shipped with all pages, blog CMS, donations, chatbot, bilingual UX.
