# Deployment & Release Guide — Spotly

This document provides exact, production-grade instructions for deploying **Spotly** to GitHub, MongoDB Atlas, Render, and Vercel.

---

## 1. Pre-Deployment Verification Summary

All automated checks and release gates have passed:

| Gate | Command | Output | Status |
| :--- | :--- | :--- | :--- |
| **Typecheck** | `npm run typecheck` | 0 errors across workspaces | **PASS** |
| **Lint** | `npm run lint` | ESLint 9 executed: 0 errors, 0 warnings | **PASS** |
| **Test** | `npm run test` | 18/18 tests passed (12 server + 6 client) | **PASS** |
| **Build** | `npm run build` | Server & client production bundles built | **PASS** |
| **Git & Secrets** | `git check-ignore` | `.env`, `node_modules`, `dist` confirmed ignored | **PASS** |

---

## 2. GitHub Repository Setup

### Step 1: Commit Clean Source Tree
From the repository root (`assignment/`):
```bash
git add .
git commit -m "feat: complete production-ready Spotly application"
```

### Step 2: Push to GitHub
1. Create a new repository on GitHub (e.g., `spotly-places-explorer`).
2. Add the remote and push:
```bash
git remote add origin https://github.com/<your-username>/spotly-places-explorer.git
git branch -M main
git push -u origin main
```

> [!IMPORTANT]
> Verify on GitHub that `.env` files are **not present**. Only `.env.example` should appear in both `server/` and `client/`.

---

## 3. MongoDB Atlas Database Setup

### Step 1: Create a Free Cluster
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new project named `spotly`.
3. Deploy a free **M0 Sandbox** cluster (AWS or GCP in your preferred region).

### Step 2: Configure Database Access
1. Under **Security > Database Access**, click **Add New Database User**:
   - Authentication Method: **Password**
   - Username: `spotly_admin`
   - Password: `<generate-a-strong-password>`
   - Database User Privileges: **Read and write to any database**
2. Click **Add User**.

### Step 3: Configure Network Access
1. Under **Security > Network Access**, click **Add IP Address**.
2. Select **Allow Access From Anywhere** (`0.0.0.0/0`) so that dynamic cloud container IPs on Render can connect.
3. Click **Confirm**.

### Step 4: Obtain Connection String
1. Under **Deployment > Database**, click **Connect**.
2. Choose **Drivers** (Node.js).
3. Copy the SRV URI:
   ```text
   mongodb+srv://spotly_admin:<password>@cluster0.xxxxx.mongodb.net/spotly?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your database user password.

### Step 5: Seed Atlas with Initial Chandigarh Demo Places
From your local machine terminal, run the idempotent seeder against Atlas:
```bash
# On Windows PowerShell:
$env:MONGODB_URI="mongodb+srv://spotly_admin:<password>@cluster0.xxxxx.mongodb.net/spotly?retryWrites=true&w=majority"; npm run seed -w server

# On macOS/Linux:
MONGODB_URI="mongodb+srv://spotly_admin:<password>@cluster0.xxxxx.mongodb.net/spotly?retryWrites=true&w=majority" npm run seed -w server
```
Expected output:
```text
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net/spotly
✅ Seeding complete. Inserted: 12, Updated: 0
```

---

## 4. Render Backend Deployment

Render hosts the Express.js API web service.

### Step 1: Create New Web Service
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository: `spotly-places-explorer`.

### Step 2: Configure Service Parameters
- **Name**: `spotly-api`
- **Region**: Choose the closest region to your Atlas cluster (e.g., Singapore, Frankfurt, Oregon).
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Free`

### Step 3: Configure Environment Variables
In the **Environment Variables** section, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production security and error formatting |
| `PORT` | `10000` | Render injects this port automatically |
| `MONGODB_URI` | `mongodb+srv://spotly_admin:<password>@cluster0.xxxxx.mongodb.net/spotly?retryWrites=true&w=majority` | Atlas connection string |
| `CORS_ORIGINS` | `https://<your-vercel-app>.vercel.app` | Allowed frontend origin (can update after Vercel deploy) |

### Step 4: Health Check Configuration
- Under **Advanced Settings**, set **Health Check Path** to:
  ```text
  /api/health
  ```
- Click **Create Web Service**.

Once deployed, Render will provide a public URL (e.g., `https://spotly-api.onrender.com`).
Verify by visiting:
```text
https://spotly-api.onrender.com/api/health
```
Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected",
    "environment": "production"
  }
}
```

---

## 5. Vercel Frontend Deployment

Vercel hosts the Vite React single-page application.

### Step 1: Import Repository
1. Log in to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** > **Project**.
3. Select your `spotly-places-explorer` repository.

### Step 2: Configure Project Settings
- **Framework Preset**: `Vite`
- **Root Directory**: Click **Edit** and select `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Configure Environment Variables
Add the following production environment variable:

| Key | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://spotly-api.onrender.com` |

*(Replace with your actual Render service URL, without a trailing slash).*

### Step 4: Deploy
1. Click **Deploy**.
2. Once the build finishes, Vercel will assign a production domain (e.g., `https://spotly-places-explorer.vercel.app`).

### Step 5: Update Backend CORS on Render
1. Return to the [Render Dashboard](https://dashboard.render.com/) > `spotly-api` service > **Environment**.
2. Update `CORS_ORIGINS` to match your exact Vercel production URL:
   ```text
   CORS_ORIGINS=https://spotly-places-explorer.vercel.app
   ```
3. Save changes; Render will redeploy with the updated CORS whitelist.

---

## 6. Post-Deployment Verification Checklist

Perform these smoke tests on the live production URL:

1. [ ] **Health Endpoint**: Visit `https://spotly-api.onrender.com/api/health` and verify `"database": "connected"`.
2. [ ] **Frontend Load**: Visit your Vercel URL. Confirm Leaflet map loads with OpenStreetMap tiles and all 12 Chandigarh pins.
3. [ ] **Search & Category Filter**: Search for `"Rose"` and filter by `"Cafe"`. Verify counts and markers sync.
4. [ ] **Create Place via Map Click**: Click **Add on Map**, click coordinates on the map canvas, fill in place details, and verify success toast.
5. [ ] **Edit Place**: Edit the created place and verify real-time update.
6. [ ] **Delete Place**: Delete the created place and confirm destructive dialog and removal.
7. [ ] **Browser Refresh**: Refresh the page to confirm changes were persisted to MongoDB Atlas.

---

## 7. Public Demo Security Safeguards

Because user authentication was excluded per hiring assignment requirements, the following safeguards are active:

1. **IP Rate Limiting**: `server/src/app.ts` limits requests to 250 requests per 15 minutes per IP in production to prevent automated flooding.
2. **Strict Zod Input Sanitization**: Caps text lengths and prevents malformed coordinates or invalid categories from reaching the database.
3. **ReDoS Protection**: `escapeRegex` escapes special characters on search queries.
4. **Reseeding Fallback**: If demo places are deleted during testing, re-run `npm run seed` to restore the 12 core Chandigarh places idempotently.
