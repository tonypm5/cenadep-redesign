# CENADEP — Product Requirements Document

## Original problem statement
Build a multi-page CENADEP NGO website (FR/EN bilingual) cloning the arcads.ai aesthetic, with GSAP scrollytelling, blog, and rebrand 2026 branding (Vert Vital #1A8F4D, Or Espoir #F1C40F, Gris Ancrage, Blanc Pureté; Montserrat + Open Sans).

## Architecture
- Backend: FastAPI + MongoDB (motor), JWT auth, Stripe via emergentintegrations, Gemini 3 Flash via emergentintegrations, Resend (graceful no-op until key provided)
- Frontend: React 19 + React Router, Tailwind CSS, GSAP + ScrollTrigger, Shadcn/UI primitives, sonner toasts, lucide-react icons, react-markdown, react-helmet-async
- Multi-page routes: /, /a-propos, /programmes, /blog, /blog/:slug, /impact, /actualites, /contact, /don, /don/merci, /admin/login, /admin/blog, /admin/inbox

## Personas
- Visitor (donor/citizen/student): explores mission, reads blog, donates, subscribes to newsletter
- Journalist / partner: looks for reports, sitemap, contact info
- Admin (CENADEP editorial team): manages blog content via markdown CMS, reads contact messages, exports newsletter list

## Done — 2026-02 (iter 1)
- Multi-page architecture + bilingual FR/EN context
- GSAP scrollytelling on Home, horizontal scroll on Programmes, animated stat counters
- Blog list + detail with Gemini 3 AI summary
- Admin JWT auth (`admin@cenadep.org` / `Cenadep2026!`) + CRUD
- Stripe one-time donations (10/25/50/100 + custom) with polling and graceful fallback
- Floating Gemini 3 chatbot (bilingual, history persisted)
- Sticky navbar + dark grain footer

## Done — 2026-02 (iter 2)
- Resend transactional email (graceful no-op when key empty): contact notification + sender confirmation + donation receipt + newsletter double opt-in
- Newsletter: `POST /api/newsletter/subscribe`, `GET /api/newsletter/confirm/:token`, admin list + CSV export
- SEO: `<SEO/>` component with react-helmet-async on key pages (title, description, OG, Twitter card, canonical, alt locale) + `GET /api/sitemap.xml`
- Markdown editor (Markdown / Preview tabs) in AdminBlog + Markdown rendering in BlogDetail via react-markdown + remark-gfm
- AdminInbox page combining contact messages + newsletter subscribers

## Done — 2026-02 (iter 3)
- New CENADEP logo + favicon (user-provided brand asset) integrated; index.html title updated
- Object storage image upload in admin (drag-and-drop, JPG/PNG/WebP, 6MB cap, served via `/api/files/{path}`)
- Blog tag filter (button bar + `?tag=` URL param, `/api/blog/tags` aggregation)
- Article scheduling (datetime-local "Publier le" field, future posts hidden from public until publish date)

## Done — 2026-02 (iter 4)
- "Trois piliers" section converted from vertical bento grid to GSAP horizontal pinned scroll on desktop (matchMedia md+), stacked vertical cards on mobile

## Backlog
- P1: Provide real RESEND_API_KEY + verified sender domain to enable email delivery
- P2: Recurring donations (deferred — requires real Stripe account + products/prices)
- P2: Replace placeholder Unsplash hero/post images with original photography
- P2: Multi-author roles + audit log
