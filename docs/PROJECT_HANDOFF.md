# Sirrond Scan — project handoff (June 2026)

Use this file to onboard a new Cursor chat. Say: **"Read `web/AGENTS.md` and `web/docs/PROJECT_HANDOFF.md`"**

---

## What it is

Mobile web app for **Veryan / Clarion** staff to digitise **Work Experience Referral** paper forms (~100/month).

- Printed form + **handwritten** answers
- **Mistral OCR 3** extracts fixed JSON schema
- Staff **review** and correct
- Output: **Google Sheet** (one tab per student, Field | Value columns) + optional Excel download
- **Supabase** planned later; currently `local` storage on device

---

## URLs & accounts

| Resource | Value |
|----------|--------|
| GitHub repo | https://github.com/alvarodoze/sirrond-scan-app |
| Vercel production | https://sirrond-scan-app.vercel.app |
| Custom domain | scan.sirrond.co.uk |
| Vercel team | Sirrond's projects (`team_ghYHDsYDlgzzcdx3iuIXP4lP`) |
| Vercel project | sirrond-scan-app (`prj_s6j1Bj3ygpMbvlCxg4mOeKsJ0Cbo`) |
| DNS (GoDaddy) | A record: `scan` → `76.76.21.21` |

Git remote (SSH): `git@github.com:alvarodoze/sirrond-scan-app.git`  
Git root is **`web/`** only — parent `SirrondOCR/` has supabase SQL + GDPR docs outside git.

---

## User flow

1. `/scan` — Take photo or choose from library → `prepareImageForUpload()` (JPEG)
2. `POST /api/extract` — Mistral `mistral-ocr-latest` + JSON schema → review data in sessionStorage
3. `/review` — Edit fields (red=required missing, yellow=empty) → Confirm
4. `saveSubmission()` — localStorage + `pushToGoogleSheet()` if URL set
5. `/history` — list + Export all Excel
6. `/form` — digital entry, same schema, no OCR

Staff notice modal on first use (`StaffNotice`).

---

## Tech stack

- **Next.js 16** App Router, TypeScript, Tailwind
- **Mistral OCR API** — `src/lib/mistral.ts`, model `mistral-ocr-latest`
- **xlsx** — Excel export (`src/lib/export.ts`)
- **Google Apps Script** — `docs/google-apps-script.js`, deployed as Web app (Anyone)
- **Supabase** — client wired, migrations in `../supabase/`, not live yet

---

## Environment

```bash
# web/.env.local (not in git)
NEXT_PUBLIC_STORAGE_MODE=local
MISTRAL_API_KEY=...
NEXT_PUBLIC_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/.../exec
```

Same three vars on **Vercel → Production**. Redeploy after changing env.

---

## Google Sheets structure

Each confirm creates **new spreadsheet tab** = student name.

Tab contents (columns A/B):

- Submitted at, Source
- Then all `WEX_REFERRAL_SCHEMA` labels + values

Payload: `{ sheetName, rows: [["Field","Value"], ...] }` from `buildGoogleSheetPayload()`.

Setup: `docs/google-sheets-setup.md`

---

## Schema

Defined in `src/schema/wex-referral.ts` as `WEX_REFERRAL_SCHEMA`.

Includes: `school` (from Clarion logo), `student_name`, `date_of_birth`, `tutor_group`, employer fields, insurance booleans, parent/guardian block.

`buildMistralJsonSchema()` generates OCR annotation format.

---

## Auth & storage modes

`src/lib/config.ts`:

- `isLocalStorageMode()` — true when `STORAGE_MODE=local` OR Supabase not configured
- Local mode: middleware skips login; extract API skips auth; data in `localStorage` key `sirrond_submissions`
- Supabase mode: email login, RLS, `wex_referrals` table (see `../supabase/migrations/001_wex_referrals.sql`)

---

## Deploy

```bash
cd web
git push origin main                    # if GitHub connected on Vercel
npx vercel deploy --prod --yes          # or CLI deploy
```

Docs: `docs/vercel-deploy.md`

**Note:** Vercel GitHub auto-deploy may need Login Connection linked in Vercel account settings.

---

## Known gotchas

1. **iPhone camera** — use label buttons "Take photo" / "Choose from photos", not div click
2. **Extract 401** — was Supabase auth; fixed for local mode
3. **Duplicate MISTRAL_API_KEY in .env** — last line wins; keep one key only
4. **HEIC** — converted to JPEG client-side before upload
5. **Google Sheets** — redeploy Apps Script after editing `google-apps-script.js`

---

## Roadmap

- [ ] DNS live for scan.sirrond.co.uk
- [ ] Connect Vercel ↔ GitHub for auto-deploy
- [ ] Supabase EU when DB access ready
- [ ] Rotate any API keys exposed in chat

---

## Conversation origin

Built from plan: low-fi Parseur, Mistral EU OCR, UK GDPR for student data, Excel/Sheets interim before database.
