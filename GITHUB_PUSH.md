# Push Jag GeoTag to GitHub

## Step 1: Create a repo on GitHub

1. Go to **https://github.com/new**
2. **Repository name:** `jag-geotag` (or any name you like)
3. **Description:** (optional) e.g. "Geo-tagging mobile app – take photos with date, time, latitude, longitude, accuracy"
4. Choose **Public**
5. **Do not** check "Add a README" (you already have files)
6. Click **Create repository**

---

## Step 2: Initialize Git (if not already)

Open a terminal in the project folder:

```powershell
cd c:\python\jag_GeoTag
git init
```

---

## Step 3: Add files and commit

```powershell
git add .
git status
git commit -m "Initial commit: Jag GeoTag app"
```

---

## Step 4: Connect to GitHub and push

Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

**Example:**
```powershell
git remote add origin https://github.com/jagna/jag-geotag.git
git branch -M main
git push -u origin main
```

If GitHub asks for login, use:
- **Username:** your GitHub username  
- **Password:** a **Personal Access Token** (not your account password)  
  - Create one: GitHub → Settings → Developer settings → Personal access tokens → Generate new token (classic), scope: `repo`

---

## Step 5: Done

Your repo will be at: `https://github.com/YOUR_USERNAME/YOUR_REPO`

---

## Optional: Add a README

If you want a short README on the repo page, create or edit `README.md` in the project root with a brief description, then:

```powershell
git add README.md
git commit -m "Add README"
git push
```

---

## Summary

| Step | Command |
|------|--------|
| 1 | Create repo at github.com/new |
| 2 | `git init` |
| 3 | `git add .` → `git commit -m "Initial commit: Jag GeoTag app"` |
| 4 | `git remote add origin https://github.com/USER/REPO.git` |
| 5 | `git branch -M main` → `git push -u origin main` |
