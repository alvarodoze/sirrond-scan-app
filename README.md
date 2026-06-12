# Sirrond Scan

Mobile web app: photograph WEX referral forms → Mistral OCR → staff review → Google Sheets.

## Quick start

```bash
cp .env.local.example .env.local   # add MISTRAL_API_KEY + Google Sheets URL
npm install && npm run dev
```

Open http://localhost:3000

## Docs

- [`AGENTS.md`](AGENTS.md) — architecture, env vars, key files
- [`docs/PROJECT_HANDOFF.md`](docs/PROJECT_HANDOFF.md) — full project detail
- [`docs/vercel-deploy.md`](docs/vercel-deploy.md) — production deploy
- [`docs/google-sheets-setup.md`](docs/google-sheets-setup.md) — Sheets integration
