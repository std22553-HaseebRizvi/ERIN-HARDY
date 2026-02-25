# Deployment Guide

## 1) Backend (Render/Railway)
1. Deploy `/server` as a Node service.
2. Set environment variables from `.env.example`.
3. Ensure MongoDB and OpenAI API key are configured.
4. Add Stripe product prices and set `STRIPE_PRICE_BASIC`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_PREMIUM`.
5. Verify `https://your-backend/health` returns `{ ok: true }`.

## 2) Frontend (Vercel)
1. Import `/client` as a Next.js project.
2. Set `NEXT_PUBLIC_API_URL` to backend URL.
3. Set `NEXT_PUBLIC_WIDGET_BASE_URL` to `https://your-frontend-domain/widget`.
4. Deploy and confirm dashboard is accessible.

## 3) DNS & CORS
- `CORS_ORIGIN` should include your frontend domain.
- If you need multiple origins, comma-separate values.

## 4) Widget Script Distribution
- Use the backend hosted script at `/widget/chatbot.js`.
- Share tenant-specific embed snippet from dashboard.
