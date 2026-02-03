# ⚠️ Netlify Configuration Guide (Critical Fixes)

If your login is working on Firefox (Desktop) but failing on Phone/Chrome, it is likely because your Netlify site is redirecting you back to `localhost` or your database settings are incorrect.

## 1. Fix the `AUTH_URL` Variable
You likely copied your local `.env` to Netlify, which has `AUTH_URL="http://localhost:3000"`.

- **Symptom**: On your phone, you log in, but then it tries to open `localhost:3000`, which doesn't exist on your phone. On your Computer, `localhost:3000` exists, so it "works" (but forces you back to your local version).
- **Fix**: Go to **Netlify > Site Settings > Environment Variables** and update:
    - **Key**: `AUTH_URL` (or `NEXTAUTH_URL`)
    - **Value**: `https://YOUR-SITE-NAME.netlify.app` (The actual link to your live site)

## 2. Fix the Database Connection
Your local project uses a file-based database (`sqlite/dev.db`). This **does not work** on Netlify because Netlify cannot read files from your computer C: drive.

- **Fix**: You must use a cloud database (like **Neon.tech**, **Supabase**, or **Railway** Postgres).
    1.  Create a free Postgres database on one of those services.
    2.  Get the Connection String (starts with `postgres://...`).
    3.  Go to **Netlify > Site Settings > Environment Variables**.
    4.  Update `DATABASE_URL` with the new Postgres string.
    5.  **Redeploy** your site (Trigger a new deploy) so the database schema applies.

## 3. Generate a Secret
Ensure you have a secure secret set on Netlify:
- **Key**: `AUTH_SECRET`
- **Value**: (Generate a random string, e.g., using `openssl rand -base64 32` or just a long random password)

---

### Summary of Required Netlify Variables
| Key | Value Example |
|---|---|
| `AUTH_URL` | `https://your-app.netlify.app` |
| `DATABASE_URL` | `postgres://user:pass@host:port/db` (Use a Cloud DB!) |
| `AUTH_SECRET` | `super_secure_random_string` |
| `AUTH_TRUST_HOST` | `true` |

Once these are set, trigger a **"Clear cache and deploy site"** in Netlify to ensure everything resets correctly.
