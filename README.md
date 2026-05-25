# Farmly

Farmly is a trust-first marketplace for local food.

The idea behind the product is simple: people should be able to discover real farmers, see how food is grown, and build confidence before they ever decide to buy. Instead of feeling like a generic ecommerce catalog, Farmly is designed to feel human, local, and story-led.

## Why this project exists

Modern food systems often feel distant and hard to trust. Farmly explores a different model:

- farmers share who they are and how they grow
- products are supported by photos, updates, and video
- discovery feels closer to a community feed than a cold catalog
- commerce follows trust, rather than trying to force it

This repository is both an active product idea and a portfolio project focused on product thinking, frontend craft, and building a clear trust-driven experience.

## Current product direction

Farmly is currently centered around:

- a cinematic landing experience
- farmer discovery and profile pages
- product storytelling with seasonal context
- video-first trust building
- onboarding and profile flows for farmers

The current MVP is intentionally narrower than a full marketplace. The goal is to validate whether people enjoy discovering and trusting local farmers through authentic content.

## Experience principles

- Trust before transaction
- Storytelling before hard selling
- Local, warm, and organic instead of generic marketplace UI
- Mobile-first product decisions
- Reusable components and scalable structure

## Tech stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS 4
- Supabase
- React 19

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Create local environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase values:

```bash
cp .env.example .env.local
```

Required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Optional legacy fallback:

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 3. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run format:check
```

## Project docs

- `docs/vision.md` - product vision and marketplace philosophy
- `docs/mvp.md` - current MVP scope and non-goals
- `docs/design-system.md` - UI direction, emotional design language, and design tokens

## Status

Farmly is an active early-stage product exploration. The repository is being shaped as:

- a public portfolio-quality codebase
- a foundation for a real business idea
- a place to iterate on product, experience, and technical architecture in public

## Roadmap themes

- deepen farmer profiles and storytelling
- improve discovery flows and seasonal browsing
- expand product and video publishing workflows
- refine trust signals across the experience
- prepare the product for broader end-to-end user testing
