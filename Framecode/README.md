# FrameCode

> The platform where developers go from idea to revenue — not just idea to deployment.

![FrameCode](https://img.shields.io/badge/FrameCode-v0.1.0-00ff88?style=flat-square&labelColor=070b12)
![SvelteKit](https://img.shields.io/badge/SvelteKit-5-ff3e00?style=flat-square&labelColor=070b12)
![Bun](https://img.shields.io/badge/Bun-runtime-fbf0df?style=flat-square&labelColor=070b12)
![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square&labelColor=070b12)

---

## What is FrameCode?

FrameCode is a full-stack developer productivity platform that combines:

- **Landing Page Template Library** — 300+ production-ready layouts
- **Browser-based IDE** — with native Bun runtime support
- **AI Conversion Meter** — scores your UI and suggests fixes via Claude API
- **ForkTooling Suite** — GitHub-native fork, CI/CD wiring, and diff tools
- **Design Hub** — token editor, component explorer, Figma sync
- **User Dashboard** — unified view of projects, repos, and activity

---

## Tech Stack

| Layer      | Choice                       | Reason                               |
| ---------- | ---------------------------- | ------------------------------------ |
| Framework  | SvelteKit 5 (Svelte 5 Runes) | SSR + file routing + form actions    |
| Runtime    | Bun                          | 3× faster installs, native SQLite    |
| Database   | SQLite → Turso (prod)        | Zero config dev, global scale prod   |
| ORM        | Drizzle                      | Type-safe, lightweight, Turso-native |
| Auth       | Custom JWT + OAuth           | No vendor lock-in                    |
| Styling    | Tailwind CSS v4              | Utility-first, fast builds           |
| AI         | Anthropic Claude API         | AI Meter scoring                     |
| Email      | Resend                       | Transactional email                  |
| Storage    | Cloudflare R2                | Zero egress fees                     |
| Payments   | Stripe                       | Industry standard                    |
| Deployment | Fly.io                       | Bun-native, global edge              |

---

## Project Structure

```
framecode/
├── src/
│   ├── app.html                    # Root HTML shell
│   ├── app.css                     # Global styles + Tailwind
│   ├── hooks.server.js             # JWT guard, rate limit, security headers
│   │
│   ├── lib/
│   │   └── server/
│   │       ├── db/
│   │       │   ├── index.js        # Drizzle client (better-sqlite3)
│   │       │   └── schema.js       # All 6 table definitions
│   │       └── services/
│   │           ├── auth.js         # JWT, bcrypt, OAuth helpers, user queries
│   │           ├── project.js      # Project CRUD + activity log
│   │           └── github.js       # GitHub API — repos, fork, import
│   │
│   └── routes/
│       ├── +layout.svelte          # Root layout (marketing nav + footer)
│       ├── +layout.server.js       # Load user data for all routes
│       ├── +page.svelte            # Landing page
│       │
│       ├── auth/
│       │   ├── login/              # Email/password login
│       │   ├── signup/             # Email/password signup
│       │   ├── logout/             # Clear JWT cookie
│       │   ├── github/             # GitHub OAuth trigger + callback
│       │   └── google/             # Google OAuth trigger + callback
│       │
│       ├── dashboard/              # Main app dashboard (real data)
│       ├── ide/                    # Browser-based IDE shell
│       │
│       └── api/
│           └── github/
│               ├── repos/          # GET — fetch user GitHub repos
│               └── import/         # POST — import repo as project
│
├── drizzle/                        # Generated SQL migrations
├── static/                         # Favicon, OG image
├── drizzle.config.js               # Drizzle Kit config
├── tailwind.config.js              # Custom colors + fonts
├── svelte.config.js                # SvelteKit config
└── package.json
```

---

## Database Schema

Six tables — all using SQLite via Drizzle ORM:

```
users           → Auth, OAuth tokens, plan tier
templates       → Template registry (slug, framework, repo URL)
projects        → User projects (FC-native + GitHub-linked)
meter_runs      → AI Meter scoring history
activity_log    → Per-user event log (deploys, syncs, meter runs)
subscriptions   → Stripe billing (pro/team plans)
```

---

## Auth System

Three authentication methods, all issuing a 7-day `httpOnly` JWT cookie:

```
Email/Password  → bcrypt hash → JWT → /dashboard
GitHub OAuth    → code exchange → upsert user → JWT → /dashboard
Google OAuth    → code exchange → upsert user → JWT → /dashboard
```

Route protection is handled in `hooks.server.js` — every request verifies the JWT before hitting any protected route. Rate limiting is applied per-IP (10 req/min on auth routes, 60 req/min elsewhere).

---

## Environment Variables

Create a `.env` file at the project root:

```bash
# App
APP_URL=http://localhost:5173
NODE_ENV=development

# JWT — generate with: openssl rand -base64 64
JWT_SECRET=

# Database
DATABASE_URL=local.db

# GitHub OAuth
# Create at: github.com/settings/developers
# Callback: http://localhost:5173/auth/github/callback
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Google OAuth
# Create at: console.cloud.google.com → APIs & Services → Credentials
# Callback: http://localhost:5173/auth/google/callback
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI Meter (Anthropic)
ANTHROPIC_API_KEY=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=noreply@framecode.dev

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=framecode-assets

# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## Getting Started

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env
# Fill in your values

# Generate and run database migrations
bun run db:generate
bun run db:migrate

# Verify tables in Drizzle Studio
bun run db:studio

# Start dev server
bun run dev
```

---

## Database Commands

```bash
bun run db:generate   # Generate SQL from schema changes
bun run db:migrate    # Apply migrations to local.db
bun run db:push       # Push schema directly (dev only)
bun run db:studio     # Open Drizzle Studio GUI
```

---

## Build Progress

### ✅ Completed

- [x] Landing page — dark terminal + glassmorphism aesthetic
- [x] Auth layout — minimal shell consistent with landing
- [x] Login page — email/password + GitHub + Google
- [x] Signup page — email/password + GitHub + Google + password strength meter
- [x] Email/password auth — bcrypt + JWT cookie
- [x] GitHub OAuth — full flow with token storage
- [x] Google OAuth — full flow
- [x] Logout — cookie clear + redirect
- [x] Route guard — `hooks.server.js` protects all app routes
- [x] Rate limiting — per-IP sliding window
- [x] Security headers — X-Frame-Options, HSTS, CSP
- [x] Database schema — 6 tables with indexes and foreign keys
- [x] Drizzle ORM — migrations run, Drizzle Studio verified
- [x] Dashboard — real data from DB (projects, activity, stats)
- [x] GitHub repos — fetched live from GitHub API on dashboard load
- [x] Import repo — saves GitHub repo as FrameCode project
- [x] IDE shell — file tree, editor, live preview, terminal panel
- [x] Dashboard layout — sidebar nav with real routing

### ⬜ In Progress / Next

- [ ] Template library — browse, filter, search, fork
- [ ] AI Conversion Meter — live scoring via Claude API
- [ ] Create Project flow — "+ New Project" button wired
- [ ] Deploy — Fly.io + Turso + custom domain

### ⬜ Planned

- [ ] ForkTooling — GitHub fork, CI/CD wiring, diff tool
- [ ] Design Hub — token editor, Figma sync
- [ ] Stripe billing — free/pro/team tiers
- [ ] Desktop app — Electron wrapper with Git operations
- [ ] `fc` CLI — one-command project scaffold
- [ ] Live collaboration — real-time multi-user IDE
- [ ] FrameCode Score — public developer reputation profile

---

## Design System

```css
/* Colors */
--fc-green:
  #00ff88 /* Primary accent */ --fc-cyan: #00d4ff /* Secondary accent */
    --fc-amber: #ffb340 /* Warning / AI meter */ --fc-bg: #070b12
    /* Page background */ --fc-surface: #0d1420 /* Card / sidebar background */
    --fc-muted: #5a6478 /* Secondary text */ --fc-dim: #3a4154
    /* Tertiary text */ /* Typography */ Space Mono → monospace labels,
  code, terminal UI DM Sans → body text Syne → display headings,
  large numbers /* Patterns */ Grid overlay → rgba(0, 255, 136, 0.02-0.03) at
    40px Scanlines → repeating-linear-gradient 2px/4px at 30-40% opacity
    Glassmorphism → bg-white/[0.04] + border-white/[0.08] + backdrop-blur;
```

---

## Scaling Path

```
Phase 1 (MVP)      SQLite local → single Fly.io instance
Phase 2 (1k MAU)   Turso distributed SQLite → Upstash Redis rate limiting
Phase 3 (100k+)    Fly.io multi-region → Turso global replicas → R2 assets
Phase 4 (1M+)      Extract IDE to separate Bun worker → CDN-first statics
```

Phases 1 and 2 require zero code changes — just swap `DATABASE_URL` from `local.db` to a Turso connection string.

---

## Contributing

FrameCode is currently in private development. Built by [@DanielDev546](https://github.com/DanielDev546).

---

## License

MIT © 2026 FrameCode
