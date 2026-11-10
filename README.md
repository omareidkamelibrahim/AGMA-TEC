# AGMA TEC — Corporate Website

Official corporate website for **AGMA TEC**, a software company. Built with a brand identity derived directly from the AGMA logo (colors, typography, and visual language), designed as a custom high-end experience — not a generic template.

## ✨ Features

- **Brand-driven design system** — palette, typography, buttons, cards and backgrounds extracted from the AGMA logo
- **Fully responsive** — desktop, tablet and mobile
- **Animated, modern UX** — scroll reveals, count-up stats, tech marquee, hover interactions
- **One-page structure**: Hero → About → Services → Process → Work → Tech Stack → Testimonials → Stats → CTA → Contact
- **Working APIs** — contact form (`POST /api/contact`) and newsletter subscription (`POST /api/newsletter`) backed by Prisma + SQLite

## 🛠 Tech Stack

| Layer     | Technology                     |
| --------- | ------------------------------ |
| Framework | Next.js 16 (App Router, TS)    |
| UI        | Tailwind CSS + shadcn/ui       |
| Database  | Prisma ORM + SQLite            |
| Runtime   | Node.js                        |

## 🚀 Getting Started

```bash
# 1. Install dependencies
bun install   # or npm install

# 2. Configure environment
echo 'DATABASE_URL="file:/path/to/dev.db"' > .env

# 3. Push the schema
bun run db:push

# 4. Run the dev server
bun run dev   # http://localhost:3000
```

Production build:

```bash
bun run build
bun run start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page composition
│   ├── layout.tsx            # Root layout & metadata
│   ├── globals.css           # Brand design tokens & global styles
│   └── api/
│       ├── contact/          # Contact form endpoint
│       └── newsletter/       # Newsletter signup endpoint
├── components/
│   ├── agma/                 # AGMA TEC sections & brand components
│   └── ui/                   # shadcn/ui primitives
└── lib/
prisma/schema.prisma          # ContactMessage & NewsletterSubscriber models
public/logo.svg               # AGMA brand mark
```

## 🎨 Brand

The visual identity (colors, logo mark, section rhythm and motion language) is based on the AGMA logo and is applied consistently across every section, breakpoint and component.

---

© AGMA TEC — All rights reserved.
