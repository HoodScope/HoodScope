# HoodScope — GitHub setup (isolated repo)

This project must **only** push to [github.com/HoodScope/HoodScope](https://github.com/HoodScope/HoodScope) — not your other local projects.

## 1. Login to GitHub

**Browser:** [https://github.com/login](https://github.com/login)

**Your HoodScope account:** [https://github.com/HoodScope](https://github.com/HoodScope)

**GitHub CLI:**

```bash
gh auth login
```

Device login: [https://github.com/login/device](https://github.com/login/device)

## 2. Use the HoodScope account

Check which account is active:

```bash
gh auth status
```

Switch before pushing:

```bash
gh auth switch -u HoodScope
```

> If you see other accounts, do **not** push HoodScope from those sessions.

## 3. Create the repository (one time)

Your profile has no public repos yet. Create **HoodScope**:

**Option A — GitHub website:** [https://github.com/new](https://github.com/new)  
- Owner: **HoodScope**  
- Repository name: **HoodScope**  
- Public · no README (this repo has one)

**Option B — CLI (logged in as HoodScope):**

```bash
cd path/to/HoodScope
gh repo create HoodScope/HoodScope --public --source=. --remote=origin --description "AI token security scanner for Robinhood Chain"
```

Or link manually:

```bash
git remote add origin https://github.com/HoodScope/HoodScope.git
```

## 4. Preflight before every push

```bash
npm run github:check
```

Verifies `package.json` name, `origin` remote, and GitHub CLI account.

## 5. Push

```bash
git add .
git commit -m "Initial HoodScope release"
git push -u origin master
```

## 6. Production domain

Site: [https://hoodscope.pro](https://hoodscope.pro)

Point DNS for `hoodscope.pro` to your Vercel/hosting deployment.

## Troubleshooting

| Problem | Fix |
|:--------|:----|
| Wrong remote | `git remote -v` then `git remote set-url origin https://github.com/HoodScope/HoodScope.git` |
| Wrong GitHub user | `gh auth switch -u HoodScope` |
| Stale credentials (Windows) | Credential Manager → remove old `git:https://github.com` entries |
| Wrong folder | Only run git commands inside `HoodScope/` |
