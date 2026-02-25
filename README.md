# AI Website Chatbot SaaS (Multi-Tenant)

Production-style starter for a sellable AI chatbot product:
- Embeddable website widget (`<script src="chatbot.js"></script>`)
- Real-time streaming AI chat with OpenAI
- Multi-tenant business dashboard
- RAG knowledge base with text/PDF upload + embeddings
- Lead capture + chat history + CSV export
- Stripe subscription-ready billing and usage limits
- Security basics (rate limit, helmet, input validation, JWT auth)

## Folder Structure

- `client/` → Next.js + Tailwind admin panel + hosted widget UI
- `server/` → Express API + auth + billing + chat streaming
- `widget/` → embeddable `chatbot.js`
- `database/` → schema notes / modeling docs
- `docs/` → setup, deployment, embed docs

## Quick Start (Local)

### 1) Environment
Copy `.env.example` to `.env` and fill all required values.

### 2) Install
```bash
npm install
npm install --workspace server
npm install --workspace client
```

### 3) Run
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## Core Capabilities Included

### Widget + UX
- Floating launcher bubble (bottom-right)
- Intercom-like panel with online/offline status
- Typing animation during streaming
- Mobile-friendly iframe sizing

### AI Chat Behavior
- Streams token responses from OpenAI (`/api/chat/stream`)
- Injects RAG context from business documents
- Friendly support tone with anti-hallucination guardrails
- Fallback response when AI is uncertain

### Admin Dashboard
- Signup/Login (JWT)
- Edit chatbot name, welcome message, theme color, online toggle
- Upload FAQ/text knowledge base entries
- View leads + analytics
- Export chat history CSV
- Generate embed snippet

### Knowledge Base (RAG)
- Text/FAQ upload endpoint
- PDF upload endpoint
- Chunking + embeddings storage
- Similarity retrieval for context injection

### Monetization / Stripe
- Checkout session endpoint by plan:
  - Basic: 500 msgs / month
  - Pro: 2000 msgs / month
  - Premium: Unlimited
- Usage counter enforced in chat route

## Embedding on Client Websites
Use:
```html
<script
  src="https://YOUR_BACKEND_DOMAIN/widget/chatbot.js"
  data-chatbot-id="TENANT_ID"
  data-chatbot-url="https://YOUR_FRONTEND_DOMAIN/widget"
  defer
></script>
```

## Deployment
See:
- `docs/DEPLOYMENT.md`
- `docs/EMBED.md`

## Production Hardening Checklist (Recommended Next)
- Add Stripe webhook route for subscription lifecycle updates
- Move embeddings to a dedicated vector DB (pgvector, Pinecone, Weaviate)
- Add RBAC + audit logs
- Add email notifications for new leads
- Add SSO and white-label custom domain support
- Add observability (Sentry, OpenTelemetry)
