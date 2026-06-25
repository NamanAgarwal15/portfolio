## Vision

Lean into **playful & experimental** while keeping the minimal Swiss base. Think: cursor that reacts, weird-but-tasteful micro-interactions, hidden moments — paired with real backend features that make the site genuinely useful for recruiters.

This requires enabling **Lovable Cloud** (database, auth, edge functions, AI gateway). All "backend" below runs there — no external accounts needed from you.

---

## 1. Working Contact Form (real email delivery)
Replace the current `mailto:` handoff with a true send.

- Edge function `send-contact` validates input (zod) and emails you via Lovable Emails (built‑in, no Resend account needed).
- Stores every submission in a `contact_messages` table so nothing is lost if email bounces.
- Honeypot + simple rate limit (1 submission / 30s per IP) to kill spam.
- Keeps the existing success toast + lock UI you already like.

## 2. Guestbook
A playful public wall where visitors leave a short note.

- Sign in with Google (one click) → leave a message (max 140 chars).
- Live feed with subtle stagger-in animation; newest on top.
- RLS: anyone can read, only authenticated users can insert their own row, only owner/admin can delete.
- Light moderation: profanity filter + you (admin role) can hide rows from a tiny `/admin` route.

## 3. "Ask Naman" AI Chat
Floating button bottom-right opens a chat panel. Streaming responses from Lovable AI (Gemini), grounded in a system prompt built from your bio, skills, experience, projects, and resume PDF text. Recruiters can ask "what's his React experience?" and get an instant answer. Includes 3 suggested starter questions and a "this is AI, may be wrong" disclaimer.

## 4. Visitor Analytics Dashboard
Lightweight, privacy-friendly (no cookies, no third-party).

- Tiny client beacon → `track-pageview` edge function → `page_views` table (path, referrer, country from CF headers, hashed IP, timestamp).
- Private `/admin` route (your user only) with:
  - Total views / unique visitors (7d, 30d, all-time)
  - Top pages, top referrers, country breakdown
  - Sparkline of last 30 days

## 5. SEO + OG Images
- Per-route `<title>`, meta description, canonical via `react-helmet-async`.
- JSON-LD `Person` schema on home, `WebSite` sitewide.
- `sitemap.xml` + `robots.txt`.
- Generated OG image (1200x630) per page — branded, with name + page title.

## 6. Playful & Experimental Layer (visual flair to match the tone)
Small, tasteful — not a circus.

- **Magnetic cursor**: existing dot grows + snaps to interactive elements on hover.
- **Hover-distort text** on hero name (letters jitter slightly on mouseover).
- **Konami-code easter egg**: triggers a confetti + temporarily flips the site to a "brutalist" theme until you press Esc.
- **Scramble-text effect** on stat counters and section headings on reveal.
- **Cursor trail** of faint dots that fade — toggleable via a `~` keyboard shortcut.
- **Reduced-motion**: all of the above disabled when `prefers-reduced-motion`.

---

## Technical Section

**Stack additions:** Lovable Cloud (Postgres + Auth + Edge Functions + AI Gateway + Emails), `react-helmet-async`, `react-markdown` (chat), `canvas-confetti` (easter egg).

**Tables (all in `public`, RLS on, grants included):**
- `contact_messages` — id, name, email, subject, message, created_at, ip_hash
- `guestbook_entries` — id, user_id (auth.users), display_name, message, created_at, hidden (bool)
- `page_views` — id, path, referrer, country, ip_hash, created_at
- `user_roles` + `app_role` enum + `has_role()` security definer (per project rule) for `/admin`

**Edge functions:** `send-contact`, `ask-naman` (streaming), `track-pageview`, `og-image` (optional; can pre-render statically instead).

**Routing:** HashRouter stays. New routes: `#/guestbook`, `#/admin`. Floating Ask-Naman is global.

**Build/Deploy:** unchanged — still static `dist/` to GitHub Pages. Edge functions live on Lovable Cloud; the static site calls them via HTTPS. The repo on GitHub stays as-is.

---

## Suggested build order
1. Enable Lovable Cloud
2. Contact form (real email) — quick win, replaces mailto
3. SEO + OG (helmet, sitemap, robots, OG images)
4. Playful interactions layer
5. Guestbook (needs Google auth)
6. Ask Naman AI chat
7. Analytics + `/admin` dashboard

You can also pick a subset — just tell me which numbers to build and in what order.