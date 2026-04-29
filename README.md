# VocabDaily — Setup Guide

A daily English vocabulary app with Hindi meanings and a streak system, built with React + Vite + Supabase.

---

<!-- ## 📁 Project Structure

```
vocab-daily-web/
├── index.html
├── vite.config.js
├── package.json
├── cron-job.js                    ← Node.js cron alternative
├── .env.example                   ← Copy to .env
├── public/
│   └── manifest.json              ← PWA manifest
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── components/
│   │   ├── WordCard.jsx
│   │   ├── WordCard.module.css
│   │   ├── StreakBanner.jsx
│   │   └── StreakBanner.module.css
│   ├── pages/
│   │   ├── Home.jsx + Home.module.css
│   │   ├── History.jsx + History.module.css
│   │   └── Settings.jsx + Settings.module.css
│   ├── context/
│   │   └── AppContext.jsx
│   ├── services/
│   │   ├── supabaseClient.js
│   │   └── api.js
│   └── utils/
│       ├── theme.js
│       └── dateHelpers.js
└── supabase/
    ├── schema.sql
    └── edge-functions/
        └── fetch-daily-words/
            └── index.js
```

---

## 🚀 Step 1 — Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) → Sign up / Log in
2. Click **New Project**
3. Choose a name (e.g., `vocab-daily`), set a strong DB password, pick a region
4. Wait ~2 minutes for the project to be created

---

## 🗄️ Step 2 — Run the Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Paste the entire contents of `supabase/schema.sql`
4. Click **Run**

This creates 4 tables and seeds 30 words (6 days × 5 words) relative to today.

---

## 🔑 Step 3 — Get Your API Keys

1. Go to **Settings → API** in Supabase
2. Copy:
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon / public** key

---

## ⚙️ Step 4 — Configure the App

In the project root, create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

---

## 📦 Step 5 — Install & Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Step 6 — Build for Production

```bash
npm run build
```

The output goes to `dist/`. Deploy to **Vercel**, **Netlify**, or any static host.

### Deploy to Vercel (easiest):
```bash
npm i -g vercel
vercel
# Follow prompts, add env vars when asked
```

---

## ⏰ Step 7 — Set Up Daily Word Generation

### Option A: Supabase Edge Function (Recommended)

**Deploy the function:**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy
supabase functions deploy fetch-daily-words
```

**Schedule it with pg_cron:**

In Supabase → SQL Editor, run:

```sql
-- Enable pg_net extension first (for HTTP calls)
create extension if not exists pg_net;

-- Schedule daily at midnight UTC
select cron.schedule(
  'daily-vocab-words',
  '0 0 * * *',
  $$
    select net.http_post(
      url    := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/fetch-daily-words',
      headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    );
  $$
);
```

Replace `YOUR_PROJECT_REF` and `YOUR_ANON_KEY` with real values.

**Verify the cron job:**
```sql
select * from cron.job;
```

### Option B: Node.js Cron (Local / VPS)

Add your service role key to `.env`:
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Run manually:
```bash
node cron-job.js
```

Add to system crontab (runs daily at midnight):
```bash
crontab -e
# Add this line:
0 0 * * * node /full/path/to/vocab-daily-web/cron-job.js >> /var/log/vocab-cron.log 2>&1
```

--- -->

## 🔥 Streak System — How It Works

| Scenario | Result |
|---|---|
| First time opening the app | streak = 1 |
| Opened yesterday | streak + 1 |
| Missed one or more days | streak reset to 1 |
| Already opened today | no change |

- `current_streak` — current consecutive days
- `longest_streak` — all-time best (never decreases)
- `last_opened_date` — updated every time the app opens

---

## 📱 PWA Installation

The app includes a `manifest.json` for PWA support:
- On **Android Chrome**: tap the menu → "Add to Home Screen"
- On **iOS Safari**: tap Share → "Add to Home Screen"
- On **Desktop Chrome**: click the install icon in the address bar

---

## 🏛️ Architecture Decisions

| Decision | Reason |
|---|---|
| Anonymous user ID | No auth required; stored in localStorage |
| Offline-first settings | localStorage saves immediately; Supabase syncs in background |
| CSS Modules | Scoped styles, zero runtime overhead |
| Context API | Lightweight global state; no Redux needed |
| `on conflict ... do nothing` | Safe upserts for history; prevents duplicate entries |

---
<!-- 
## 🐛 Troubleshooting

**No words showing?**
- Make sure you ran `schema.sql` in Supabase SQL Editor
- Check that today's date matches the seed data dates
- Open browser DevTools → Console for error messages

**Supabase connection failed?**
- Verify `.env` values (no trailing spaces)
- Check that RLS is disabled (schema.sql does this by default)
- Confirm your Supabase project is active (not paused)

**Streak not updating?**
- The `user_streaks` table uses `user_id` as unique key
- Your user ID is stored in `localStorage` as `vocab_user_id`

---

## 🎨 Color Palette

| Name | Hex | Usage |
|---|---|---|
| Background | `#FAF8F5` | App background |
| Orange Accent | `#E8651A` | CTAs, streak banner, accents |
| Green (Hindi) | `#2D5016` | Hindi meaning text |
| Text | `#1A1208` | Primary text |
| Muted | `#7A6A56` | Secondary text, labels |
| Border | `#EDE8E1` | Card borders |

---

Made with ❤️ for daily learners. -->
