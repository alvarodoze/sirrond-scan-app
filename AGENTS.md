# Sirrond Scan — agent handoff (read this first in new chats)

Low-fi Parseur for **Clarion WEX Referral** forms: photo → Mistral OCR → staff review → Google Sheets (one tab per student).

## Live

| What | URL |
|------|-----|
| Production | https://sirrond-scan-app.vercel.app |
| Custom domain | https://scan.sirrond.co.uk (DNS: A `scan` → `76.76.21.21`) |
| GitHub | https://github.com/alvarodoze/sirrond-scan-app |
| Vercel project | `sirrond-scan-app` / team `sirrond-s-projects` (`prj_s6j1Bj3ygpMbvlCxg4mOeKsJ0Cbo`) |

## Repo layout

```
SirrondOCR/                    # parent folder (not all in git)
├── web/                       # ← GIT ROOT — Next.js app, deploy this
│   ├── src/app/               # pages: scan, review, form, history
│   ├── src/app/api/extract/   # Mistral OCR proxy (no image stored)
│   ├── src/schema/wex-referral.ts  # single source of truth for fields
│   ├── src/lib/mistral.ts     # OCR API call
│   ├── src/lib/export.ts      # Excel + Google Sheets payload
│   ├── src/lib/config.ts      # local vs supabase mode
│   └── docs/                  # vercel-deploy, google-sheets-setup
├── pilot/                     # standalone Python Mistral test script
└── supabase/migrations/       # for when DB access is ready
```

## Architecture

```
iPhone Safari → /scan → POST /api/extract → Mistral OCR (EU)
              → /review (edit JSON) → saveSubmission()
              → localStorage (interim) + POST Google Apps Script (new tab/student)
```

- **No Supabase yet** — `NEXT_PUBLIC_STORAGE_MODE=local`, no login required
- **Images never stored** — memory-only in extract route
- **Google Sheets** — Apps Script `doPost` creates tab named after student; Field|Value rows
- **Phase 2 done** — `/form` digital entry, same schema

## Env vars

**Local:** `web/.env.local`  
**Vercel:** Project → Settings → Environment Variables

| Variable | Notes |
|----------|--------|
| `MISTRAL_API_KEY` | Server only |
| `NEXT_PUBLIC_STORAGE_MODE` | `local` (now) or `supabase` (later) |
| `NEXT_PUBLIC_GOOGLE_SHEETS_URL` | Apps Script `/exec` URL |

## Key files to touch

| Task | File |
|------|------|
| Add/change form fields | `src/schema/wex-referral.ts` |
| OCR prompt / model | `src/lib/mistral.ts` |
| Sheet tab structure | `src/lib/export.ts` + `docs/google-apps-script.js` |
| Camera / upload UX | `src/components/CameraCapture.tsx`, `src/lib/image-upload.ts` |
| Skip auth locally | `src/lib/config.ts` → `isLocalStorageMode()` |

## Commands

```bash
cd web
npm install && npm run dev          # http://localhost:3000
npm run build                       # verify before deploy
npx vercel deploy --prod --yes      # redeploy (CLI linked)
python3 ../pilot/mistral_ocr_pilot.py  # OCR-only test (needs ../.env or MISTRAL_API_KEY)
```

## Form schema (WEX Referral)

30 fields in `WEX_REFERRAL_SCHEMA`: school (from logo), student_name, DOB, employer block, insurance checkboxes, parent section. Required: `school`, `student_name`, `date_of_birth`, `employer_name_and_address`.

Sample form image: parent `.cursor/.../assets/image-d2eec029-....png` (WEX form, Clarion).

## GDPR

Docs in parent `../docs/gdpr/` (DPIA template, privacy notice, sub-processors). Children's data — UK GDPR. Mistral EU OCR; no image retention.

## Not built (deliberate)

- Parseur-style template editor
- Multi-form builder
- Native iOS app
- Supabase in production yet

## Full detail

See `docs/PROJECT_HANDOFF.md`

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
Next.js 16 — read `node_modules/next/dist/docs/` if unsure. App uses middleware (auth skip in local mode).
<!-- END:nextjs-agent-rules -->
