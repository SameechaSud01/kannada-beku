# Kannada Beku — Cloudflare Pages deploy

A static, multi-file site. No build step, no command line — upload the folder
and it's live.

```
cloudflare-deploy/
├── index.html            → the marketing site (home page)
├── privacy.html          → privacy policy (also at /privacy)
├── site-system.jsx       ┐
├── site-screens.jsx      │
├── site-about.jsx        │  the site's code — loaded by index.html.
├── site-questionnaire.jsx│  Keep these next to index.html.
├── site-app.jsx          │
├── tweaks-panel.jsx      ┘
├── _headers              → security + caching headers
└── _redirects            → maps /privacy → /privacy.html
```

## Why multi-file (no loading splash)
The previous single-file build showed a brief icon "splash" on every load while
it unpacked. This version renders straight onto the page instead — no splash.
The `.jsx` files must stay in the same folder as `index.html`.

## Deploy — drag & drop (~3 min)
1. dash.cloudflare.com → **Workers & Pages → Create → Pages → Upload assets**.
2. Drag the **contents** of this folder in (so `index.html` is at the top level,
   not inside a nested folder).
3. Name it (e.g. `kannada-beku`) → **Deploy**.
4. You get a live `*.pages.dev` URL. Add your domain under **Custom domains**.

## Deploy — connect Git (auto-deploy on push)
Put these files at a repo root → Cloudflare Pages → **Connect to Git** →
Framework preset **None**, build command empty, output dir **/**.

## Waitlist (Supabase)
Your Supabase credentials are already baked into `site-questionnaire.jsx`, and
the `waitlist` table is reachable. Do one live test signup after deploying and
confirm the row appears in Supabase → Table Editor → `waitlist`. If it errors,
ensure the anon insert policy exists:

```sql
alter table public.waitlist enable row level security;
create policy "anon can join waitlist"
  on public.waitlist for insert to anon with check (true);
```

## Notes
- The privacy policy states the site uses **no analytics**. Update section 06 if
  that changes.
- To edit the site, change the matching file in the project's `marketing/`
  folder, then re-copy it here (or just edit the copy directly).
