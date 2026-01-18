# Personal Finance Tracker - SolidJS + Supabase

A modern, fast, and feature-rich personal finance tracker built with **SolidJS** and **Supabase**.

## 🚀 Quick Start

```bash
cd solid-app
npm install
npm run dev
```

Open http://localhost:3000

## ✨ Features

- **Context Management** - Separate personal, work, and business finances
- **Transactions** - Track income and expenses with categories
- **Budgets** - Set monthly spending limits and track progress
- **Savings Goals** - Monitor progress towards financial goals
- **Investments** - Track portfolio performance and ROI
- **Subscriptions** - Manage recurring payments
- **Data Visualization** - Spending charts and insights
- **Dark Mode** - Beautiful dark theme support
- **Mobile Responsive** - Works great on all devices
- **Toast Notifications** - Better user feedback
- **Offline Indicators** - Know your connection status

## 🎯 Getting Started

1. **Setup Database**
   - Create a Supabase project at https://supabase.com
   - Run the SQL in `supabase-migration.sql`
   - Run the SQL in `solid-app/fix-rls-policies.sql`

2. **Configure Environment**
   - Copy `solid-app/.env.example` to `solid-app/.env`
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

3. **Install & Run**
   ```bash
   cd solid-app
   npm install
   npm run dev
   ```

## 📚 Documentation

- **[README_FIRST.md](solid-app/README_FIRST.md)** - Start here for setup
- **[QUICK_START.md](solid-app/QUICK_START.md)** - 10-minute test guide
- **[BROWSER_TESTING.md](solid-app/BROWSER_TESTING.md)** - Complete test checklist
- **[CONTEXT_MANAGEMENT.md](solid-app/CONTEXT_MANAGEMENT.md)** - Context features guide
- **[TESTING_GUIDE.md](solid-app/TESTING_GUIDE.md)** - Detailed test scenarios

## 🛠️ Tech Stack

### Frontend
- **SolidJS** - Reactive UI framework (40% smaller than React!)
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Vite** - Lightning-fast build tool
- **@solidjs/router** - Client-side routing
- **solid-toast** - Toast notifications
- **Chart.js** - Data visualization
- **date-fns** - Date utilities

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Realtime subscriptions
  - Edge Functions (optional)
  - Row Level Security

## 📊 Bundle Size

- **Production build**: ~95 KB gzipped
- **40% smaller** than equivalent React app
- Code-split and lazy-loaded routes
- Optimized for performance

## 🎨 UI Features

- ✅ Toast notifications (no alert boxes!)
- ✅ Confirmation dialogs
- ✅ Category icons with colors
- ✅ Mobile card layouts
- ✅ Empty states with CTAs
- ✅ Auto-focus forms
- ✅ Keyboard shortcuts (Escape key)
- ✅ Spending pie chart
- ✅ Dark mode support
- ✅ Context edit/delete

## 🧪 Testing

```bash
cd solid-app
npm run dev
```

Then follow the testing guides in the `solid-app/` folder.

## 🏗️ Build for Production

```bash
cd solid-app
npm run build
npm run preview  # Test the build
```

Deploy the `solid-app/dist/` folder to:
- Vercel (recommended)
- Netlify
- Cloudflare Pages
- Any static host

## 📁 Project Structure

```
EBUDJ/
├── solid-app/              # SolidJS application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Route pages
│   │   ├── stores/         # Global state
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   └── ...
│   ├── public/             # Static assets
│   ├── supabase/           # Edge functions & SQL
│   └── ...
└── supabase-migration.sql  # Database schema
```

## 🔐 Security

- No authentication implemented (personal use)
- Row Level Security disabled for simplicity
- For production: Enable RLS + Auth
- Never commit `.env` file

## 🤝 Contributing

This is a personal project, but feel free to fork and customize!

## 📝 Migration Notes

This app was migrated from React + Express to SolidJS + Supabase:
- **Before**: React 18 + Express + SQLite (193 KB bundle)
- **After**: SolidJS + Supabase (95 KB bundle)
- **Result**: 51% smaller, faster, and modern

See `MIGRATION_COMPLETE.md` for migration details.

## 🎉 What's New

### Recent Enhancements (v2.0)
- Context management (edit/delete)
- Toast notification system
- Confirmation dialogs
- Category icons
- Mobile responsive cards
- Data visualization charts
- Enhanced empty states
- Welcome screen
- Auto-focus forms
- Dark mode improvements

## 🐛 Troubleshooting

### 401 Errors
Run `fix-rls-policies.sql` in Supabase SQL Editor

### Missing Environment Variables
Check `.env` has correct `VITE_` prefixed variables

### Styles Broken
Verify Tailwind CSS v3 is installed (not v4)

### Build Errors
Run `npm install` to ensure all dependencies are installed

## 📧 Support

For issues or questions, check the documentation in `solid-app/` folder.

## 📜 License

MIT License - Free for personal and commercial use

---

**Built with ❤️ using SolidJS and Supabase**

Happy tracking! 🎯
