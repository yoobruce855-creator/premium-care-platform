# 🚀 Premium Care Platform - Complete Deployment Guide

## Quick Start

This guide will deploy your Premium Care Platform to production in ~60 minutes.

**What you'll deploy:**
- 🔥 Firebase Realtime Database (data storage)
- 🖥️ Render (backend API + WebSocket)
- 🌐 Vercel (frontend PWA)

---

## Prerequisites

- [ ] GitHub account with repository: `yoobruce855-creator/premium-care-platform`
- [ ] Firebase project: `premium-care-platform` (already created)
- [ ] Render account (free tier)
- [ ] Vercel account (free tier)

---

## Step 1: Firebase Configuration (15 min)

### 1.1 Download Service Account Key

1. Open: https://console.firebase.google.com/project/premium-care-platform/settings/serviceaccounts/adminsdk
2. Click **"Generate new private key"**
3. Click **"Generate key"** in confirmation dialog
4. Save JSON file to your Downloads folder

### 1.2 Configure Database Rules

1. Open: https://console.firebase.google.com/project/premium-care-platform/database/premium-care-platform-default-rtdb/rules
2. Replace with the following rules:

```json
{
  "rules": {
    "patients": {
      "$patientId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "vitals": {
          ".indexOn": ["timestamp"]
        },
        "alerts": {
          ".indexOn": ["timestamp", "severity"]
        }
      }
    },
    "users": {
      "$userId": {
        ".read": "auth.uid === $userId",
        ".write": "auth.uid === $userId"
      }
    }
  }
}
```

3. Click **"Publish"**

### 1.3 Enable Authentication

1. Open: https://console.firebase.google.com/project/premium-care-platform/authentication
2. Click **"Get started"** (if not already enabled)
3. Click **"Email/Password"**
4. Toggle **"Enable"**
5. Click **"Save"**

### 1.4 Extract Firebase Credentials

Run the helper script:

```powershell
.\scripts\setup-firebase-env.ps1
```

This will:
- Find your service account JSON
- Extract all required values
- Generate a JWT secret
- Save to `backend/.env.firebase` for reference

**Keep this terminal open** - you'll need these values for Render.

---

## Step 2: Deploy Backend to Render (20 min)

### 2.1 Create Web Service

1. Open: https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect account"** (if first time) and authorize GitHub
4. Find `premium-care-platform` repository
5. Click **"Connect"**

### 2.2 Configure Service

**Basic Settings:**
- Name: `premium-care-backend`
- Region: `Oregon (US West)`
- Branch: `main`
- Root Directory: `backend`
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `node server.js`

**Instance Type:**
- Select: `Free`

### 2.3 Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Copy values from the `setup-firebase-env.ps1` output:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `JWT_SECRET` | *(from script output)* |
| `FIREBASE_PROJECT_ID` | `premium-care-platform` |
| `FIREBASE_DATABASE_URL` | *(from script output)* |
| `FIREBASE_CLIENT_EMAIL` | *(from script output)* |
| `FIREBASE_PRIVATE_KEY` | *(from script output - include quotes!)* |
| `FRONTEND_URL` | `https://temporary.vercel.app` *(update later)* |

**⚠️ IMPORTANT for FIREBASE_PRIVATE_KEY:**
- Copy the ENTIRE value including the quotes
- Should start with `"-----BEGIN PRIVATE KEY-----\n`
- Should end with `\n-----END PRIVATE KEY-----\n"`

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. Look for **"Live"** status with green dot
4. Copy your backend URL (e.g., `https://premium-care-backend.onrender.com`)

### 2.5 Verify Backend

```powershell
Invoke-WebRequest -Uri https://YOUR-BACKEND-URL.onrender.com/health
```

**Expected response:**
```json
{
  "status": "ok",
  "firebase": "connected",
  "version": "1.0.0"
}
```

✅ If you see `"firebase": "connected"` - perfect!
❌ If you see `"firebase": "demo mode"` - check your Firebase environment variables

---

## Step 3: Deploy Frontend to Vercel (15 min)

### 3.1 Import Project

1. Open: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Find `yoobruce855-creator/premium-care-platform`
4. Click **"Import"**

### 3.2 Configure Project

**Framework Preset:** Vite (auto-detected)

**Root Directory:** `./` (leave as is)

**Build Settings:**
- Build Command: `npm run build` (auto-detected)
- Output Directory: `dist` (auto-detected)
- Install Command: `npm install` (auto-detected)

### 3.3 Set Environment Variables

Click **"Environment Variables"**

Add these variables (replace `YOUR-BACKEND-URL` with your Render URL):

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://YOUR-BACKEND-URL.onrender.com/api` |
| `VITE_WS_URL` | `wss://YOUR-BACKEND-URL.onrender.com` |

**Example:**
```
VITE_API_URL=https://premium-care-backend.onrender.com/api
VITE_WS_URL=wss://premium-care-backend.onrender.com
```

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes for build
3. Look for **"Congratulations!"** message
4. Click **"Visit"** to see your app
5. Copy your frontend URL (e.g., `https://premium-care-platform.vercel.app`)

---

## Step 4: Update CORS Settings (5 min)

Now that you have your Vercel URL, update the backend:

1. Go to Render Dashboard: https://dashboard.render.com/
2. Click on `premium-care-backend` service
3. Click **"Environment"** tab
4. Find `FRONTEND_URL` variable
5. Click **"Edit"**
6. Update value to your Vercel URL: `https://premium-care-platform.vercel.app`
7. Click **"Save Changes"**

Render will automatically redeploy (takes ~2 minutes).

---

## Step 5: Verify Deployment (10 min)

### 5.1 Run Verification Script

```powershell
.\scripts\verify-deployment.ps1 `
    -BackendUrl "https://YOUR-BACKEND-URL.onrender.com" `
    -FrontendUrl "https://YOUR-FRONTEND-URL.vercel.app"
```

This will test:
- ✓ Backend health endpoint
- ✓ Backend API info
- ✓ Frontend loading
- ✓ CORS configuration
- ✓ Response times

### 5.2 Manual Testing

1. **Open your Vercel URL** in browser
2. **Register** a new account
3. **Login** with your credentials
4. **Verify dashboard** shows vital signs
5. **Check real-time updates** (every 3 seconds)
6. **Open DevTools** (F12) → Network → WS tab
7. **Confirm WebSocket** connection is active (green)

### 5.3 Check Firebase Data

1. Open: https://console.firebase.google.com/project/premium-care-platform/database/premium-care-platform-default-rtdb/data
2. You should see:
   - `patients/` node with your patient data
   - `users/` node with your user data
   - Real-time vital signs being stored

### 5.4 Test PWA Installation

**Desktop (Chrome/Edge):**
1. Look for install icon (⊕) in address bar
2. Click to install
3. App opens in standalone window

**Mobile (Android):**
1. Open site in Chrome
2. Tap menu (⋮) → "Add to Home Screen"
3. App installs like native app

---

## 🎉 Deployment Complete!

**Your Production URLs:**

- 🌐 **Frontend**: https://premium-care-platform.vercel.app
- 🖥️ **Backend**: https://premium-care-backend.onrender.com
- 🔥 **Firebase**: https://console.firebase.google.com/project/premium-care-platform

---

## 📊 Monitoring & Maintenance

### Render Dashboard
- **Logs**: View real-time server logs
- **Metrics**: CPU, memory usage
- **Auto-deploy**: Pushes to `main` branch auto-deploy

### Vercel Dashboard
- **Deployments**: View build history
- **Analytics**: Page views, performance
- **Auto-deploy**: Pushes to `main` branch auto-deploy

### Firebase Console
- **Database**: Monitor data usage
- **Authentication**: Manage users
- **Usage**: Track reads/writes

---

## 🔧 Troubleshooting

### Backend shows "demo mode"
**Problem**: Firebase not connected
**Solution**: 
1. Check Render environment variables
2. Verify `FIREBASE_PRIVATE_KEY` includes quotes and `\n`
3. Re-run `setup-firebase-env.ps1` to get correct format

### Frontend can't connect to backend
**Problem**: CORS error in browser console
**Solution**:
1. Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
2. No trailing slash in URL
3. Wait for Render to redeploy after changing env vars

### WebSocket connection fails
**Problem**: WSS connection refused
**Solution**:
1. Verify `VITE_WS_URL` uses `wss://` (not `ws://`)
2. Check backend is running (visit `/health` endpoint)
3. Render free tier sleeps after 15min - first request takes 30s

### Build fails on Vercel
**Problem**: Build error
**Solution**:
1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Test build locally: `npm run build`

---

## 🚀 Next Steps

1. **Custom Domain**: Add your own domain in Vercel settings
2. **Stripe Payments**: Add Stripe keys to enable subscriptions
3. **Email Alerts**: Configure SMTP for email notifications
4. **Monitoring**: Set up Sentry for error tracking
5. **Analytics**: Add Google Analytics

---

## 📞 Support

- **Documentation**: See `/docs` folder
- **API Docs**: Visit `https://YOUR-BACKEND-URL/api`
- **GitHub Issues**: Report bugs on GitHub

---

**Congratulations! Your Premium Care Platform is now live! 🎊**
