# Google Sheets setup — one tab per person

Each confirmed form creates a **new tab** named after the student (Field | Value rows).

See [`google-apps-script.js`](google-apps-script.js) and [`vercel-deploy.md`](vercel-deploy.md) for production env vars.

## Quick steps

1. Create spreadsheet at [sheets.google.com](https://sheets.google.com)
2. **Extensions** → **Apps Script** → paste `google-apps-script.js` → Save
3. **Deploy** → Web app → Execute as **Me**, access **Anyone** → copy `/exec` URL
4. Set `NEXT_PUBLIC_GOOGLE_SHEETS_URL` in Vercel (or `web/.env.local` locally)
5. Test: run `testAppend` in Apps Script, or Confirm a form in the app
