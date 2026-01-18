# Quick Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is fine)

## Step-by-Step Setup

### 1. Database Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase project, go to the SQL Editor
3. Copy and paste the contents of `../supabase-migration.sql` into the SQL Editor
4. Click "Run" to execute the migration and create all tables
5. (Optional) Run `supabase/sql/dashboard_rpc.sql` for the optimized dashboard function

### 2. Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy your **anon/public key** (starts with `eyJ...`)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 6. Create Your First Context

When you first open the app:
1. Click on "Select Context" button
2. Click "Create New Context"
3. Enter a name (e.g., "Personal") and select a type
4. Start adding transactions, budgets, etc.!

## Optional: Deploy Edge Function

If you want automatic budget updates when transactions are created:

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link your project: `supabase link --project-ref your-project-id`
4. Deploy the function:
   ```bash
   supabase functions deploy update-budget
   ```

5. Uncomment the Edge Function call in `src/pages/Transactions.tsx` (search for "TODO")

## Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

## Deployment Options

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Cloudflare Pages
Connect your GitHub repo to Cloudflare Pages with:
- Build command: `npm run build`
- Output directory: `dist`

## Troubleshooting

### "Missing Supabase environment variables" error
Make sure you created a `.env` file and added your Supabase credentials.

### No data showing up
1. Check that your Supabase tables were created correctly
2. Verify your environment variables are correct
3. Check the browser console for any API errors

### Build errors
Run `npm run type-check` to see detailed TypeScript errors (they won't prevent the build though).

## Next Steps

- Customize the categories in each page to match your needs
- Deploy the Edge Function for automatic budget tracking
- Add the dashboard RPC function for better performance
- Set up Row-Level Security (RLS) if you want multi-user support

## Need Help?

Check the main [README.md](README.md) for detailed documentation.
