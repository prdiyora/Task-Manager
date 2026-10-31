# Task Manager

Personal mobile-friendly work dashboard: today's plan, all work projects with goals and targets, done tracking, and a daily log. Hosted on GitHub Pages behind a password gate.

## How it works

- `index.html` - the dashboard app (mobile-first, dark theme) plus the password gate. After unlock, tap a checkbox when a task finishes; it moves to **Done**. Checkbox state is stored on the device (localStorage) per day. Unlocked data is kept in sessionStorage so a refresh in the same tab does not re-ask.
- `data.js` - the ONLY content file, and it is **encrypted**: AES-256-GCM, key derived from the site password with PBKDF2-SHA256 (250k iterations). The plaintext is never committed to this repo.
- `scripts/encrypt.mjs` - encrypts the plaintext into `data.js`.
- `robots.txt` + `noindex` meta - asks search engines not to index the site.

## Daily update flow (Instinct, nightly after the Teams night report)

1. Build the day's content as JSON (same content as the Teams plan/report): `today.plan` with `done` flags, `projects[].last_update` + progress, `goals[]`, and prepend the day to `log`. Write it to a temp `data.plain.json` (never commit this file).
2. Encrypt: `node scripts/encrypt.mjs data.plain.json <password-file> data.js` (password from the Instinct vault entry "Task Manager site gate").
3. Commit + push ONLY `data.js`; GitHub Pages republishes within a minute.
4. Manual checkbox taps are per-device and reset each new day.

## Changing the password

Re-encrypt with the new password (`scripts/encrypt.mjs` with a new password file) and push `data.js`. Old sessions unlock until the tab closes.

## Privacy notes

The Pages site is publicly reachable by URL; the gate + encryption is a light lock, not real account security. Keep secrets, income numbers, client names and other private details OUT of the data even so. The repo history contains no plaintext data.
