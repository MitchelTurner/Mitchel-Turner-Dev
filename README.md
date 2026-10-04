# mitchelturner.dev

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Personal portfolio for **[Mitchel Turner](https://github.com/MitchelTurner)** — a Next.js site that auto-builds a project showcase from public GitHub repositories, with an about page and a password-protected admin area.

**Live site:** [mitchelturner.dev](https://mitchelturner.dev)

---

## Overview

This repo powers a developer portfolio that stays current without manual updates. Point it at a GitHub username and it:

- Pulls public repositories and ranks them by activity and stars
- Generates a unique **1200×630 cover graphic** per repo (via `next/og`)
- Shows language breakdowns, topics, stars, and deployment links
- Refreshes on a short cache interval (~2 minutes) with an optional force-refresh from admin

The homepage **is** the portfolio. A separate `/about` page covers background and freelance availability. The admin dashboard (`/admin`) is unlisted and password-protected.

---

## Features

| Area | What it does |
|------|----------------|
| **Live Work** (`/`) | Full GitHub portfolio — repo cards with generated art, language bars, deployment badges |
| **About** (`/about`) | Bio, work areas, stack, and contact CTA |
| **Contact** (`/contact`) | Contact form that emails the owner (via Resend), with a `mailto:` fallback |
| **OG graphics** (`/api/og/repo`, `/api/og/site`) | On-the-fly cover images for Live Work repos and Other sites |
| **Admin** (`/admin`) | Hidden dashboard — GitHub sync settings, project CRUD, image upload |
| **Auth** | HMAC cookie session; password never stored client-side |

### GitHub integration

- Username resolution: **admin DB** → `GITHUB_USERNAME` env → `github.config.json`
- Deployment status from repo homepage, GitHub Pages, or the Deployments API
- Rate-limit aware: without a token, deployment badges are fetched for the first
  ~12 repos only (60 req/hr limit); a `GITHUB_TOKEN` raises the limit to 5,000
  req/hr and shows deployments for **every** repo
- "View demo" links resolve in order: `LIVE_URL_OVERRIDES` (see
  `src/lib/liveUrls.ts`) → repo **homepage** → the Deployments API URL → GitHub
  Pages. Railway/GitHub *dashboard* URLs are ignored — only public live sites
  are linked. Add an override (or set the repo homepage) for each deployed app

---

## Architecture

```mermaid
flowchart TB
  subgraph public [Public pages]
    Home["/  Live Work"]
    About["/about"]
  end

  subgraph api [API routes]
    GH["/api/github/repos"]
    OG["/api/og/repo · /api/og/site"]
    Settings["/api/settings/github"]
  end

  subgraph data [Data layer]
    Config["github.config.json"]
    Env["GITHUB_USERNAME env"]
    DB[(SQLite via Prisma)]
    GHA["GitHub REST API"]
  end

  subgraph admin [Hidden admin]
    Admin["/admin"]
    Login["/api/admin/login"]
  end

  Home --> GH
  GH --> Config
  GH --> Env
  GH --> DB
  GH --> GHA
  Home --> OG
  Admin --> Settings
  Admin --> Login
  Settings --> DB
```

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Database | SQLite + [Prisma](https://www.prisma.io/) |
| Graphics | `next/og` (dynamic PNG) |

---

## Getting started

### Prerequisites

- Node.js 22+ (the app also runs on Node 20; `npm test` needs Node’s TypeScript stripper)
- npm 10+

### Setup

```bash
# Clone and install
git clone https://github.com/MitchelTurner/Mitchel-Turner-Dev.git
cd Mitchel-Turner-Dev
npm install

# Environment
cp .env.example .env
# Edit ADMIN_PASSWORD (required) and optionally GITHUB_USERNAME / GITHUB_TOKEN

# Database
npx prisma migrate dev

# (Optional) sample showcase projects for admin area
npm run db:seed

# Dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin](http://localhost:3000/admin) (default password `changeme`).

---

## Configuration

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite path, e.g. `file:./dev.db` |
| `ADMIN_PASSWORD` | Yes | Password for `/admin` (change before deploy) |
| `GITHUB_USERNAME` | No | GitHub account for Live Work |
| `GITHUB_TOKEN` | Recommended | Read-only token: 60 → 5,000 req/hr and deployment badges for every repo (without it, only the first ~12 repos are enriched) |
| `RESEND_API_KEY` | No | [Resend](https://resend.com) API key for the `/contact` form. Without it the form falls back to a `mailto:` link |
| `CONTACT_TO_EMAIL` | No | Inbox for contact submissions (default `info@mitchelturner.dev`) |
| `CONTACT_FROM_EMAIL` | No | Verified Resend sender, e.g. `Mitchel Turner <contact@mitchelturner.dev>` |

### `github.config.json`

Committed fallback when env/DB are unavailable (ideal for serverless):

```json
{
  "username": "your-github-handle"
}
```

---

## Project structure

```
├── github.config.json       # Fallback GitHub username (works on serverless)
├── prisma/
│   ├── schema.prisma        # Project, Vote, Setting models
│   ├── seed.mjs             # Optional sample data
│   └── migrations/
├── public/
│   ├── robots.txt           # Disallows /admin from crawlers
│   └── uploads/             # Admin-uploaded images (gitignored)
└── src/
    ├── app/
    │   ├── page.tsx         # Homepage → Live Work portfolio
    │   ├── about/           # About page
    │   ├── admin/           # Hidden admin dashboard
    │   ├── github/          # Redirects to /
    │   └── api/
    │       ├── github/      # Repo sync + refresh
    │       ├── og/repo/     # Dynamic cover graphics
    │       ├── settings/    # GitHub username config
    │       ├── projects/    # Showcase CRUD + voting (admin-managed)
    │       └── admin/       # Login / session
    ├── components/          # UI (LiveWorkPortfolio, RepoCard, LogoMark, …)
    ├── lib/
    │   ├── github.ts        # GitHub API client + normalization
    │   ├── settings.ts      # Username resolution chain
    │   ├── auth.ts          # Admin session (HMAC cookie)
    │   └── prisma.ts        # DB client singleton
    └── middleware.ts        # noindex headers for /admin
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Prisma generate + production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests for URL, rate-limit, and language-bar helpers |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed sample projects |
| `npm run db:reset` | Reset DB and re-seed |

---

## Deployment

**Self-hosted / VPS / Railway / Render** — SQLite + local `public/uploads` work out of the box.

**Serverless (Vercel, etc.)** — SQLite and filesystem uploads are ephemeral. Recommended:

1. Set `GITHUB_USERNAME` in host environment variables
2. Or commit your username in `github.config.json`
3. For admin persistence, use a hosted database (Turso, Postgres) and object storage for uploads

Set `ADMIN_PASSWORD` to a strong secret in production.

---

## License

[MIT](LICENSE) © Mitchel Turner
