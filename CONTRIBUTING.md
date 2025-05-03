
# 👥 Contributing Guide for Lyrics-Game

This guide explains how to work together using GitHub best practices to keep things smooth and clean. 💡

---

## 🔧 Workflow Overview

A protected `main` branch is used, which means:

- ✅ All changes must go through Pull Requests (PRs)
- ✅ Every PR requires **CODEOWNERS review**
- 🔒 Force-pushes and deletions to `main` are disabled
- 🧼 Use **"Squash and merge"** to keep history clean

---

## 🔀 Working on a Feature

1. **Create a branch for your task**  
   Name it descriptively:
   ```bash
   git checkout -b feature/your-task
   ```

2. **Make your changes**  
   Commit often and clearly:
   ```bash
   git commit -m "feat: add search bar to UI"
   ```

3. **Push your branch**  
   ```bash
   git push origin feature/your-task
   ```

4. **Open a Pull Request**  
   - Base branch: `main`
   - Link issues (e.g. `Fixes #3`)
   - Add checklist or description

5. **Request a review from your teammate**

---

## ✏️ For Small Changes

For minor changes (docs, typos, formatting):

- Still open a PR
- Add a note like:  
  > 📘 Docs-only change, safe to self-approve

- Review and squash-merge your own PR if it's clearly safe

---

## 🛡️ Protected Branch Rules

These are active on `main`:

- Require PR before merging
- Require 1 approval
- Require linear history (no merge commits)
- Disallow force pushes
- Disallow deletion

---

## 📦 After Merging

After merging a PR:

```bash
git checkout main
git pull origin main
git branch -d your-feature-branch
```

---

Happy coding!
