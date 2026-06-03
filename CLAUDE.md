@AGENTS.md

# HisaabAI — Project Context

## What this project is
AI-powered personal finance PWA (Progressive Web App). Users track daily expenses,
set monthly budgets, view spending charts, and get AI-powered saving tips.
Mobile-first design — installable on phone via "Add to Home Screen".

## Stack (never change)
- Next.js 14 App Router + TypeScript (strict)
- MongoDB Atlas M0 (free) + Mongoose ODM
- OpenRouter API (free) — meta-llama/llama-3.1-8b-instruct:free
- NextAuth.js v5 — email/password + Google OAuth
- shadcn/ui + Tailwind CSS v3
- Recharts (expense charts)
- next-pwa (PWA support)
- Vercel free hobby tier

## Key rules
- All AI calls → src/lib/openrouter.ts only
- All DB calls → src/lib/mongodb.ts singleton only
- Never use `any` in TypeScript
- Never edit src/components/ui/ files
- Every protected API route must check getServerSession()
- Tailwind only — no inline styles
- Mobile-first: design for 390px width first, then desktop
- Currency: always show ₹ symbol, Indian number format (1,00,000)
- Font: Inter (NOT Architects Daughter — this is a finance app)

## What is already set up
- Next.js 14 project created
- shadcn/ui initialized
- globals.css — Saffron + Charcoal theme

## Current build phase
Phase 1 — Foundation (mongodb, openrouter, auth, types, models)

## Environment variables
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OPENROUTER_API_KEY=