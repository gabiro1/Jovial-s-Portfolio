# Deployment Guide

Architecture:

```
Browser
  └── Vercel (static frontend/ + dashboard)
        ├── /api/*      ──proxy──►  Render (backend/ Express API) ──► MongoDB Atlas
        └── /uploads/*  ──proxy──►  Render
```

The frontend keeps using relative paths (`/api/...`, `/uploads/...`). Vercel proxies
them to the backend, so there are **no code changes** and **no CORS setup** needed.

---

## 1. Database — host MongoDB on Atlas

Local MongoDB lives only on your computer; Render cannot reach `localhost:27017`.
Use a free **MongoDB Atlas** cluster (M0).

1. Go to https://cloud.mongodb.com and create a free project + cluster (M0).
2. **Database Access** → create a database user (remember the password).
3. **Network Access** → add IP `0.0.0.0/0` (allow from anywhere).
   Render's free-tier outbound IPs are not fixed, so a specific IP will not work.
4. **Connect → Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/portfolio?retryWrites=true&w=majority
   ```
5. Migrate your existing local content into Atlas. Pick ONE:

   **Option A — copy local data as-is (recommended; keeps your admin password)**
   ```powershell
   # from backend/, with ATLAS_MONGODB_URI set to your Atlas string:
   node migrate-to-atlas.js
   ```
   Copies every collection without changing anything else. Safe to re-run.

   **Option B — re-seed into Atlas (resets content + admin password)**
   - In `backend/.env`, set `MONGODB_URI` to the Atlas string.
   - Run `npm run seed` from `backend/`. This clears the Atlas collections
     and re-inserts the portfolio content + the admin user.

   **Option C — mongodump/mongorestore**
   ```bash
   mongodump --db portfolio --out ./dump
   mongorestore --uri "mongodb+srv://<user>:<password>@<cluster>.mongodb.net" ./dump
   ```

6. Keep the Atlas string out of Git — it goes into Render's environment variables.

> Security: the Atlas password in `backend/.env` was used during development. If that
> file was ever pushed to GitHub, rotate the database user password in Atlas now.

---

## 2. Backend — Render

1. Render → **New → Web Service** → connect the GitHub repo
   (`gabiro1/Jovial-s-Portfolio`).
2. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/bio` (already set in `render.yaml`)
3. Environment variables (Render dashboard, or the `render.yaml` blueprint):
   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | your Atlas connection string |
   | `JWT_SECRET` | a long random string |
   | `ADMIN_DEFAULT_EMAIL` | your login email (must match the existing Atlas admin, e.g. `jovialgfleuron@yopmail.com`) |
   | `ADMIN_DEFAULT_PASSWORD` | a strong password |
   > `PORT` is provided automatically by Render — do not set it.
4. Deploy. On first boot the server creates an admin **only if that email does not
   already exist** — since your migrated Atlas DB already has the admin, set
   `ADMIN_DEFAULT_EMAIL` to that same address so no second account is created.
5. Test: `https://<your-service>.onrender.com/api/bio` should return JSON.

Optional: instead of creating the service by hand, Render can read `render.yaml`
(**New → Blueprint**) from the repo root.

---

## 3. Frontend — Vercel

1. Edit `frontend/vercel.json` and replace both occurrences of
   `REPLACE-WITH-YOUR-RENDER-URL` with your actual Render URL
   (e.g. `jovial-portfolio-api.onrender.com`). Keep `https://` and the path.
2. Vercel → **New Project** → import the same GitHub repo.
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Other
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)
4. Deploy.
5. Test:
   - `https://<project>.vercel.app/` → portfolio loads with dynamic content
   - `https://<project>.vercel.app/dashboard` → admin login

---

## Notes & caveats

- **Uploads do not persist on Render.** Its filesystem is ephemeral: images uploaded
  from the dashboard are wiped on every deploy/restart. The images currently in
  `frontend/uploads/` are committed to the repo, so they survive; *new* uploads will not.
  For durable uploads, switch `backend/middleware/upload.js` to Cloudinary/S3, or attach
  a Render persistent disk (paid).
- **Vercel proxy body limit** (~4.5 MB). Uploads are limited to 5 MB in Multer; if large
  images fail in production, lower the limit in `backend/middleware/upload.js` or upload
  directly to Cloudinary.
- **Render free tier sleeps** after ~15 min of inactivity. The next request takes
  30–50s to wake the service.
- **Secrets** live only in Render's environment variables. Never commit `backend/.env`.
- Change the admin password from **Dashboard → Settings** after the first login.
