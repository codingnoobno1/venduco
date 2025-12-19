<<<<<<< HEAD
# 🚀 Netlify Deployment Guide

## Prerequisites

1. GitHub account
2. Netlify account (free at netlify.com)
3. MongoDB Atlas cluster (free tier)

---

## Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/vendorconnect.git
git push -u origin main
```

---

## Step 2: Connect to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub account
4. Select the `vendorconnect` repository
5. Netlify auto-detects the Next.js settings

---

## Step 3: Configure Environment Variables

In Netlify Dashboard:
**Site settings** → **Environment variables** → **Add variable**

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/vendorconnect` |
| `JWT_SECRET` | `your-super-secret-key-min-32-chars` |

---

## Step 4: Deploy

Click **"Deploy site"**

Netlify will:
1. Clone your repo
2. Run `npm install`
3. Run `npm run build`
4. Deploy to CDN

---

## Build Settings (Auto-detected)

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Publish directory | `.next` |
| Functions directory | `netlify/functions` |

---

## Custom Domain (Optional)

1. Go to **Domain settings**
2. Add your custom domain
3. Netlify provides free SSL

---

## Troubleshooting

### Build fails?
- Check Node version is 18 or 20
- Verify all env variables are set
- Check build logs for errors

### API routes not working?
- Ensure `@netlify/plugin-nextjs` is installed
- Check `netlify.toml` is in root

---

## Files Created

```
vendorconnect/
├── netlify.toml         ✅ Created
└── package.json         ✅ Updated with plugin
```

---

## Useful Commands

```bash
# Test build locally
npm run build

# Install Netlify CLI (optional)
npm install -g netlify-cli

# Deploy from CLI
netlify deploy --prod
```
=======
# 🚀 Netlify Deployment Guide

## Prerequisites

1. GitHub account
2. Netlify account (free at netlify.com)
3. MongoDB Atlas cluster (free tier)

---

## Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/vendorconnect.git
git push -u origin main
```

---

## Step 2: Connect to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub account
4. Select the `vendorconnect` repository
5. Netlify auto-detects the Next.js settings

---

## Step 3: Configure Environment Variables

In Netlify Dashboard:
**Site settings** → **Environment variables** → **Add variable**

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/vendorconnect` |
| `JWT_SECRET` | `your-super-secret-key-min-32-chars` |

---

## Step 4: Deploy

Click **"Deploy site"**

Netlify will:
1. Clone your repo
2. Run `npm install`
3. Run `npm run build`
4. Deploy to CDN

---

## Build Settings (Auto-detected)

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Publish directory | `.next` |
| Functions directory | `netlify/functions` |

---

## Custom Domain (Optional)

1. Go to **Domain settings**
2. Add your custom domain
3. Netlify provides free SSL

---

## Troubleshooting

### Build fails?
- Check Node version is 18 or 20
- Verify all env variables are set
- Check build logs for errors

### API routes not working?
- Ensure `@netlify/plugin-nextjs` is installed
- Check `netlify.toml` is in root

---

## Files Created

```
vendorconnect/
├── netlify.toml         ✅ Created
└── package.json         ✅ Updated with plugin
```

---

## Useful Commands

```bash
# Test build locally
npm run build

# Install Netlify CLI (optional)
npm install -g netlify-cli

# Deploy from CLI
netlify deploy --prod
```
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
