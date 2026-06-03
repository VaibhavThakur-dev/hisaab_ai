# HisaabAI — Agent Instructions

## Agent identity
You are a senior full-stack developer building HisaabAI — an AI-powered personal
finance PWA. Write complete, production-ready code every time. No partial snippets.

---

## Tech Stack (Never change)
- **Framework**: Next.js 14 App Router + TypeScript strict
- **Database**: MongoDB Atlas M0 + Mongoose ODM
- **AI**: OpenRouter API — `meta-llama/llama-3.1-8b-instruct:free`
- **Auth**: NextAuth.js v5 — Credentials + Google OAuth
- **UI**: shadcn/ui + Tailwind CSS v3 — mobile-first
- **Charts**: Recharts
- **PWA**: next-pwa
- **Validation**: Zod + React Hook Form
- **Deploy**: Vercel free
- **State Management**: Zustand v5

---

## Folder Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx            ← bottom nav bar (mobile)
│   │   ├── dashboard/page.tsx    ← home: balance, recent expenses
│   │   ├── expenses/
│   │   │   ├── page.tsx          ← expense list + filters
│   │   │   └── add/page.tsx      ← add expense form
│   │   ├── budget/page.tsx       ← set + view monthly budget
│   │   ├── charts/page.tsx       ← spending charts + trends
│   │   └── ai-tips/page.tsx      ← AI saving tips + analysis
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   └── [...nextauth]/route.ts
│   │   ├── expenses/
│   │   │   ├── route.ts          ← GET list, POST create
│   │   │   └── [id]/route.ts     ← PUT edit, DELETE
│   │   ├── budget/route.ts       ← GET + POST monthly budget
│   │   ├── ai/
│   │   │   ├── tips/route.ts     ← AI saving tips
│   │   │   └── analysis/route.ts ← monthly spending analysis
│   │   └── dashboard/route.ts    ← aggregated stats
│   └── layout.tsx
├── components/
│   ├── ui/                       ← shadcn (NEVER edit)
│   ├── expense-card.tsx
│   ├── add-expense-sheet.tsx     ← bottom sheet on mobile
│   ├── budget-ring.tsx           ← circular budget progress
│   ├── spending-chart.tsx        ← Recharts wrapper
│   ├── category-badge.tsx
│   ├── bottom-nav.tsx            ← mobile navigation
│   └── ai-tip-card.tsx
├── lib/
│   ├── mongodb.ts
│   ├── openrouter.ts
│   ├── auth.ts
│   └── utils.ts                  ← cn(), formatCurrency(₹), formatDate()
├── models/
│   ├── User.ts
│   ├── Expense.ts
│   ├── Budget.ts
│   └── AiTip.ts
└── types/
    └── index.ts
```

---

## MongoDB Models

### User.ts
```ts
{ name, email, password(nullable), image, currency: "INR", createdAt }
```

### Expense.ts
```ts
{
  userId: ObjectId,
  amount: Number,           // in paise (₹1 = 100 paise) — avoid float issues
  category: "food" | "transport" | "shopping" | "bills" | "entertainment" | "health" | "education" | "other",
  description: String,
  date: Date,
  createdAt: Date
}
```

### Budget.ts
```ts
{
  userId: ObjectId,
  month: String,            // "2026-06" format
  totalBudget: Number,      // in paise
  categoryLimits: {
    food: Number, transport: Number, shopping: Number,
    bills: Number, entertainment: Number, health: Number,
    education: Number, other: Number
  },
  createdAt: Date
}
```

### AiTip.ts
```ts
{
  userId: ObjectId,
  month: String,
  tips: [String],           // array of AI-generated tips
  analysis: String,         // monthly spending analysis
  generatedAt: Date
}
```

---

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | /api/auth/register | Email register + bcrypt |
| GET | /api/expenses | List with filters (month, category) |
| POST | /api/expenses | Create expense |
| PUT | /api/expenses/[id] | Edit expense |
| DELETE | /api/expenses/[id] | Delete expense |
| GET | /api/budget | Get current month budget |
| POST | /api/budget | Set/update budget |
| GET | /api/dashboard | Stats: total spent, remaining, top category |
| POST | /api/ai/tips | Generate AI saving tips |
| POST | /api/ai/analysis | Monthly spending analysis |

---

## OpenRouter Integration (src/lib/openrouter.ts)

```ts
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'meta-llama/llama-3.1-8b-instruct:free'

async function callAI(messages, maxTokens = 800, temperature = 0.7) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXTAUTH_URL,
      'X-Title': 'HisaabAI',
    },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: maxTokens, temperature })
  })
  const data = await res.json()
  return data.choices[0].message.content
}
```

### AI Prompt Templates

**Saving Tips:**
```
system: "You are a personal finance advisor for Indian users. Give practical, actionable advice. Always use ₹ symbol."
user: "Analyze my spending for {month}:
Total budget: ₹{budget}
Total spent: ₹{spent}
Category breakdown: {categories}
Give me 5 specific saving tips based on my spending pattern. Be concise."
```

**Monthly Analysis:**
```
system: "You are a financial analyst. Be direct and use Indian context (₹, Indian cities, Indian spending habits)."
user: "My {month} expenses:
{expense_list}
Give a 3-sentence analysis: what I spent most on, how I compare to typical Indian spending, and one key action to take next month."
```

---

## UI Rules (Mobile-first PWA)

- **Bottom navigation** — 5 icons: Home, Expenses, Add(+), Charts, AI Tips
- **Add button** — center, larger, saffron colored (like CRED)
- **Cards** — rounded-2xl, shadow, dark bg in dark mode
- **Currency format** — always `₹1,234` (Indian format)
- **Amounts** — store in paise, display divided by 100
- **Expense colors** — red for debit, green for income/savings
- **Charts** — Recharts PieChart for categories, BarChart for monthly trend
- **Loading** — shadcn Skeleton, never blank screen
- **Empty states** — always show helpful message + CTA button

### shadcn components to install
```bash
npx shadcn@latest add button input card dialog select label badge
npx shadcn@latest add sheet progress skeleton separator scroll-area
npx shadcn@latest add sonner avatar tabs dropdown-menu
```

---

## PWA Setup (next-pwa)

```ts
// next.config.ts
import withPWA from 'next-pwa'
export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})
```

### public/manifest.json
```json
{
  "name": "HisaabAI",
  "short_name": "HisaabAI",
  "description": "AI-powered expense tracker",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#1C1C1E",
  "theme_color": "#FF9500",
  "orientation": "portrait",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## Coding Rules

1. **Complete files only** — never partial code
2. **TypeScript strict** — no `any`
3. **Mobile-first** — all components designed for 390px first
4. **Indian formatting** — ₹ symbol, paise storage, Indian number format
5. **Auth check** — every protected route starts with getServerSession()
6. **Error handling** — try/catch everywhere, meaningful messages
7. **Loading states** — Skeleton during every async operation
8. **MongoDB singleton** — only lib/mongodb.ts, never direct connect

---

## Feature Build Order
```
Phase 1: lib/mongodb.ts → lib/openrouter.ts → lib/auth.ts → types/index.ts → all models
Phase 2: Register/Login pages → NextAuth → middleware → protected layout
Phase 3: Add expense → Expense list → Dashboard stats
Phase 4: Budget set/track → Budget ring component → Overspend alerts
Phase 5: Charts (pie + bar) → Monthly trends
Phase 6: AI tips → Monthly analysis → AiTip model
Phase 7: PWA setup → manifest.json → icons → Vercel deploy
```

---

## Common Mistakes to Avoid
- Store amounts in PAISE not rupees (avoid float precision issues)
- Always format: `(amount / 100).toLocaleString('en-IN')` for display
- Never hardcode month — use `new Date().toISOString().slice(0, 7)`
- Mobile bottom nav needs `pb-20` padding on all pages (nav height)
- PWA manifest theme_color must match saffron: `#FF9500`