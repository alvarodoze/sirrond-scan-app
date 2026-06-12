# Deploy to Vercel — scan.sirrond.co.uk

## Overview

| What | Where |
|------|--------|
| Scanner app | `https://scan.sirrond.co.uk` (Vercel) |
| Google Sheets sync | Your Apps Script `/exec` URL (env var) |
| OCR | Mistral API (server env var) |

Staff open the custom domain on iPhone → scan → confirm → new tab in Google Sheet.

---

## Deploy without wasting build minutes

**Use Git → Vercel, not repeated CLI deploys.** Each build costs the same whether you run `npx vercel deploy --prod` or push to GitHub — but Git only builds when you actually push.

| Do | Don't |
|----|--------|
| Push to `main` when app code changes | Run `vercel deploy --prod` after every small tweak |
| Change env vars in Vercel dashboard, then **Redeploy** once | Redeploy after every env test |
| Keep **Preview deployments** off if you don't use PR previews | Let every branch/PR trigger a build |
| Commit docs (`*.md`, `docs/`) separately — builds are skipped | Mix doc-only edits with code in the same commit |

This repo includes `vercel.json` **Ignored Build Step**: commits that only touch `docs/`, `*.md`, or `AGENTS.md` skip the build (exit code trick — no minutes used).

**One-time Vercel settings** (Project → Settings → Git):

1. **Production Branch:** `main`
2. **Preview Deployments:** disable if you don't need PR previews (~half your builds if you use branches)
3. **Connect GitHub** so pushes deploy automatically — no CLI needed day-to-day

**Typical workflow:**

```bash
cd web
npm run build          # verify locally first (free)
git push origin main   # one production build on Vercel
```

Only use `npx vercel deploy --prod --yes` for the first deploy or if GitHub isn't connected yet.

---

## 1. Push code to GitHub

From the `web/` folder (this is the git repo):

```bash
cd web
git add .
git commit -m "Prepare for Vercel deployment"
```

Create a new repo on GitHub (e.g. `sirrond-scan`), then:

```bash
git remote add origin https://github.com/YOUR_ORG/sirrond-scan.git
git push -u origin main
```

---

## 2. Import into Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Root directory: **`./`** (repo root is already `web/`)
5. **Do not deploy yet** — add environment variables first

---

## 3. Environment variables

In Vercel → Project → **Settings** → **Environment Variables**, add:

| Name | Value | Environments |
|------|--------|--------------|
| `MISTRAL_API_KEY` | Your Mistral API key | Production, Preview |
| `NEXT_PUBLIC_STORAGE_MODE` | `local` | Production, Preview |
| `NEXT_PUBLIC_GOOGLE_SHEETS_URL` | Your Apps Script web app URL (`.../exec`) | Production, Preview |

Then click **Deploy** (or redeploy if you already deployed).

> `MISTRAL_API_KEY` has no `NEXT_PUBLIC_` prefix — it stays server-side only.

---

## 4. Custom domain — scan.sirrond.co.uk

1. Vercel → Project → **Settings** → **Domains**
2. Add: `scan.sirrond.co.uk`
3. Vercel shows a **CNAME** target (e.g. `cname.vercel-dns.com`)

At your DNS provider for `sirrond.co.uk`:

| Type | Name | Value |
|------|------|--------|
| CNAME | `scan` | *(value Vercel gives you)* |

Wait 5–60 minutes for DNS. Vercel issues HTTPS automatically.

---

## 5. Smoke test

1. Open `https://scan.sirrond.co.uk/scan` on iPhone
2. Accept staff notice
3. Take photo → wait for review screen
4. **Confirm** → check Google Sheet for new student tab

---

## 6. iPhone home screen (optional)

Safari → Share → **Add to Home Screen** — works like an app.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Scan works locally but not on Vercel | Check `MISTRAL_API_KEY` in Vercel env vars; redeploy |
| Confirm doesn’t update Sheet | Check `NEXT_PUBLIC_GOOGLE_SHEETS_URL`; see [google-sheets-setup.md](google-sheets-setup.md) |
| 401 on scan | Ensure `NEXT_PUBLIC_STORAGE_MODE=local` is set on Vercel |
| Domain not working | DNS CNAME only on `scan`, not `@`; wait for propagation |

---

## Later: Supabase

When database access is ready, add on Vercel:

```
NEXT_PUBLIC_STORAGE_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Run migrations in `../supabase/migrations/` (repo parent folder).
