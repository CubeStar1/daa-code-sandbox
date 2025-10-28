# DAA Code Sandbox

A lightweight web app for practicing Design and Analysis of Algorithms (DAA). It features a Monaco-based code editor, problem descriptions, test cases, and in-browser execution via OneCompiler or Judge0. Auth, persistence, and progress tracking are powered by Supabase. Optional email verification uses Resend. An experimental AI route is included for generating problems with OpenAI.

## Tech stack
- Next.js 15 (App Router) + React 19
- Tailwind CSS + Radix UI + Shadcn UI components
- Monaco Editor
- Supabase (auth, database)
- OneCompiler (RapidAPI) and/or Judge0 for code execution
- Resend (emails)
- AI SDK + OpenAI (optional)

## Quick start
1. Install dependencies
   - Requires Node 18+ (recommended LTS) and pnpm
   - In PowerShell:
     ```powershell
     pnpm install
     ```
2. Configure environment variables
   - Create a `.env.local` file in the project root with the vars below.
3. Run the dev server
   ```powershell
   pnpm dev
   ```
   App runs on http://localhost:3000

## Environment variables
Add only what you need; you can start with Supabase + OneCompiler and add others later.

- Supabase
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_ADMIN (server-only, service role key)
- App branding (optional)
  - NEXT_PUBLIC_APP_NAME
  - NEXT_PUBLIC_APP_ICON
  - NEXT_PUBLIC_APP_LOGO
- OneCompiler (RapidAPI)
  - ONECOMPILER_API_KEY
- Judge0 (if using Judge0 path)
  - JUDGE0_API_URL (e.g., https://judge0-ce.p.rapidapi.com or your instance)
  - RAPIDAPI_HOST (if using RapidAPI)
  - RAPIDAPI_KEY (if using RapidAPI)
  - C_LANGUAGE_ID (e.g., 50)
  - CPP_LANGUAGE_ID (e.g., 54)
- OpenAI (optional AI features)
  - OPENAI_API_KEY
- Resend (optional email verification)
  - RESEND_API_KEY
  - RESEND_DOMAIN (e.g., yourdomain.com)

## Useful scripts
- pnpm dev — start the Next.js dev server
- pnpm build — production build
- pnpm start — start the production server
- pnpm lint — run Next.js ESLint

## Project layout
- `app/` — routes (API and UI), layouts, pages
- `components/` — UI and editor components
- `lib/` — integrations (supabase, judge0, onecompiler, types, utils)
- `hooks/` — React hooks (API, user, submit)
- `public/` — static assets