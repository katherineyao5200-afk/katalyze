# Katalyze Website — Setup Guide

**👉 START HERE. This is the only instruction file you need.**

This folder has everything Claude Code needs to build the site.
**Follow the steps in order. Don't skip ahead.**

*(Note: this file is named SETUP.md rather than README.md on purpose — the Next.js
installer in Step 3 creates its own README.md, and would overwrite these instructions.
If you see a README.md appear later, that's Next.js's own file. Ignore it.)*

---

# PART 1 — Set up the project (10 minutes)

## Step 1: Unzip and move the folder

Unzip this folder and move it somewhere you keep projects. For example:

- **Mac:** `/Users/yourname/projects/katalyze`
- **Windows:** `C:\Users\yourname\projects\katalyze`

Rename the folder to `katalyze` if it isn't already.

## Step 2: Open a terminal inside the folder

**Mac:** Open Terminal, then type `cd ` (with a space), drag the folder onto the Terminal window, press Enter.

**Windows:** Open the folder in File Explorer, click the address bar, type `cmd`, press Enter.

To confirm you're in the right place, type this and press Enter:

```
ls
```

(On Windows use `dir` instead.)

You should see `CLAUDE.md`, `docs`, `public`, and `brand-assets` listed. If you don't, you're in the wrong folder.

## Step 3: Install Next.js into this folder

Copy and paste this exactly:

```
npx create-next-app@latest . --typescript --tailwind --app
```

**The `.` (period) is important** — it means "install here" instead of creating a new nested folder.

**What to expect:**
- It may ask to install `create-next-app` → say **yes**
- It will warn the directory isn't empty → say **yes** to continue
- It asks a few setup questions → **press Enter** to accept defaults for all of them
- Takes 1–3 minutes

Your `CLAUDE.md`, `docs/`, `brand-assets/`, and existing `public/` files are preserved.

## Step 4: Open in VS Code

```
code .
```

If that doesn't work, just open VS Code manually and use **File → Open Folder** to select the katalyze folder.

## Step 5: Start Claude Code

In VS Code, open a terminal (**Terminal → New Terminal** from the menu bar), then type:

```
claude
```

If it says `claude: command not found`, install it first:

```
npm install -g @anthropic-ai/claude-code
```

Then run `claude` again.

---

# PART 2 — Get Supabase ready (5 minutes)

You need this before build step 5. Do it now so you're not blocked later.

1. Go to **supabase.com** and create a free account
2. Create a new project (any name — remember the database password)
3. In the left sidebar click **SQL Editor**, then **New query**
4. Paste this and click **Run**:

```sql
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now(),
  source text
);
```

5. Go to **Project Settings → API** and copy two values:
   - **Project URL**
   - **service_role** key (under "Project API keys" — click to reveal it)

6. In VS Code, create a new file called `.env.local` in the project root and paste:

```
NEXT_PUBLIC_SUPABASE_URL=paste_your_project_url_here
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here
```

⚠️ **Never share the service_role key or commit it to GitHub.** Confirm `.env.local` is listed in `.gitignore` (Next.js adds it automatically).

---

# PART 3 — Working with Claude Code

## Your first message

Copy and paste this exactly:

```
Read CLAUDE.md and docs/PRD.md in full before doing anything.
Then confirm you understand the project and describe your plan for
build steps 1-4 from the PRD build order. Do not write any code yet.
```

**Why:** making it explain the plan first catches misunderstandings before they become hundreds of lines of wrong code.

## Then go step by step

The PRD has a build order in section 12. Work through it **two steps at a time**, not all at once. Copy these prompts one at a time:

```
Do step 2: set up the design tokens in globals.css and the Tailwind
config using the exact brand hex values from CLAUDE.md.
```

```
Do step 3: load the Migra fonts from public/fonts. Remember only
weights 200 and 800 exist.
```

```
Do step 4: build the Nav, Footer, and root layout.
```

```
Do step 5: build the WaitlistForm component, the /api/waitlist route,
and the Supabase integration. I want to test a real submission
before we move on.
```

**Stop at step 5 and actually test it.** Submit your own email, then check the Supabase table to confirm the row appeared. Don't move on to animation until this works.

Then continue with steps 6 through 13 the same way.

## Useful things to say

| Situation | What to say |
|---|---|
| See what it's doing | `Explain what you just changed and why.` |
| It broke something | `That broke [X]. Revert that change and try a different approach.` |
| It drifted off-brand | `Re-read CLAUDE.md. You used a color/weight that isn't in the tokens.` |
| Want to see it | `Run the dev server so I can look at it.` |
| Ready to deploy | `Walk me through deploying this to Vercel.` |

---

# What's in this folder

```
CLAUDE.md                      Auto-loaded by Claude Code every session.
                               Brand tokens, hard rules, conventions.
                               Keep this file — it's what stops drift.

docs/
  PRD.md                       The full site spec. Pages, sections, copy,
                               interactions, build order, done criteria.
  product-engineering-spec.md  Hardware truth. Consult before writing any
                               copy about how the device works.
  brand-kit/                   Brand kit images for visual reference.
  visual-references/           Your actual mood-board images, indexed and
                               mapped to specific PRD sections. Claude Code
                               reads these before building anything visual.

public/                        Web-ready assets, already in place.
  fonts/                       Migra woff2 + woff (what the site loads).
  images/logo/                 Logo lockups: horizontal, stacked, mark-only,
                               in navy / cream / periwinkle / transparent.
  favicon-16.png
  favicon-32.png
  apple-touch-icon.png

brand-assets/                  Master originals. Not used by the site —
                               keep these for design work elsewhere.
  migra-original/              Complete Migra download: otf, ttf, eot, woff,
                               woff2, plus the license agreement.
  branding-kit-original/       Your five brand kit boards, full quality.
  logo-original-illustrator-export.png
```

---

# Two things to remember

**Migra license.** These files are Pangram Pangram's free **personal-use** tier (see `brand-assets/migra-original/LICENSE-personal-use.txt`). Buy a commercial license at pangrampangram.com before the site goes live publicly.

**Product renders don't exist yet.** The PRD handles this — every image slot is built swap-ready with placeholder gradients. When your renders are done, update `/lib/images.ts` and they drop straight in.
