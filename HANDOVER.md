# SomaEdu - Handover & Status Documentation

This document describes the current features implemented, architectural improvements, and instructions for running and seeding the database.

## What has been accomplished so far:

1. **Parent Dashboard Real-Time Syncing Fix (`src/app/(parent)/parent/dashboard/page.tsx`)**
   - **Problem**: When a parent logged in, a race condition occurred in the real-time Firestore listener. If the parent document existed, the listener initiated multiple nested async reads for student profiles within the same handler, locking up the UI or causing infinite redirects.
   - **Fix**: We split the logic. The real-time listener *only* listens to changes in the list of linked `studentIds`. A separate `useEffect` fetches student details sequentially whenever `studentIds` changes.

2. **Premium Design Language System (`src/app/globals.css`)**
   - **Primary Palette**: Shifted from a generic charcoal tone to a vibrant, curated Indigo/Violet theme (`--primary: 250 84% 54%`).
   - **Glassmorphism**: Enhanced `.glass-panel` to use a true semi-transparent backdrop blur (`backdrop-filter: blur(16px)`) with elegant shadows and thin borders suitable for dark and light modes.
   - **Loader UI**: Updated `src/app/page.tsx` redirecting state from a crude loader to a sleek spinning loading state.

3. **UNEB Curriculum Database Seeder (`src/app/api/admin/seed/route.ts`)**
   - **Goal**: Populate Firestore with actual UNEB curriculum data (Subjects, Topics, Lessons, and Questions with Marking Schemes) for product demonstrations.
   - **Security**: Secured behind a query parameter `secret` utilizing the environment variable `ADMIN_SECRET` (falls back to `somaedu123`).

---

## Technical Instructions for Run & Seed

### Local Development Server
To see the changes locally, you must first start the development server:
```bash
npm run dev
```
Once the server is running, the app will be available at [http://localhost:3000](http://localhost:3000).

### Seeding the Database (Live or Local)
Once the changes build on Vercel (after our GitHub push) or run locally, you can trigger the data seed via browser:
- **Local URL**: `http://localhost:3000/api/admin/seed?secret=somaedu123`
- **Vercel Production URL**: `https://[your-deployed-domain].vercel.app/api/admin/seed?secret=somaedu123`
*(Note: If you have configured a custom `ADMIN_SECRET` environment variable in Vercel, replace `somaedu123` with your secret value.)*
