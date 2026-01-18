# Personal Finance Tracker

A comprehensive personal finance management web application that helps you track and manage your finances across multiple contexts (Home, Work, and Business) including transactions, subscriptions, savings, budgets, and investments.

## 🚀 Features

### Multi-Context Management
- Organize finances across Home, Work, and Business contexts
- Dynamic theme switching based on context type
- Context selector with dropdown and management options

### Dark Mode & Theming
- Complete dark mode support with system preference detection
- Smooth theme transitions and persistent user preferences
- Modern glass morphism design with enhanced animations

### Transaction Tracking
- Record income and expense transactions
- Categorize transactions (Food & Dining, Transportation, Shopping, etc.)
- Filter by type (Income/Expense)
- Edit and delete transactions
- Account tracking

### Subscription Management
- Manage recurring subscriptions
- Track billing dates and amounts
- Set subscription status (Active/Paused/Cancelled)
- Monitor total subscription costs

### Savings Goals
- Record savings contributions
- Set savings goals with progress tracking
- Visual progress bars
- Organize by savings accounts (Emergency Fund, Vacation Fund, etc.)

### Budget Management
- Set monthly spending limits by category
- Track actual spending vs budgets
- Visual progress indicators
- Monthly budget management

### Investment Portfolio
- Track investments across different asset types (Stock, Crypto, Mutual Fund, Property, etc.)
- Monitor profit/loss with percentage calculations
- Filter investments by type
- View total invested vs current value

### Interactive Dashboard
- Visual charts showing income vs expenses
- Spending by category pie charts
- Savings progress visualization
- Investment performance charts
- Financial summary cards

### Data Management
- Export all data to JSON format for backup
- Import previously exported data
- Automatic database backups via Supabase
- Data validation and error handling

### Security & Performance
- Input validation with express-validator
- Rate limiting and security headers with Helmet
- Optimized database queries with indexes
- Supabase PostgreSQL database with automatic backups

## 🛠 Tech Stack

- **Frontend**: React 18.3 + TypeScript + Tailwind CSS + Recharts
- **Backend**: Node.js 20 + Express 4.19
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts for data visualization
- **Testing**: Jest + Supertest
- **Security**: Helmet, Rate Limiting, Input Validation
- **Features**: Dark Mode, Export/Import, Data Backup

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm
- Supabase account (sign up at https://supabase.com)

### Setup

1. **Create a Supabase Project**
   - Go to https://supabase.com and sign in
   - Click "New Project"
   - Fill in your project details (name, password, region)
   - Wait for the project to be created (takes a few minutes)

2. **Get Your Supabase Credentials**
   - In your Supabase project dashboard, go to **Settings** → **API**
   - Copy the following values:
     - **Project URL** (this is your `SUPABASE_URL`)
     - **anon/public key** (this is your `SUPABASE_ANON_KEY`)
     - **service_role key** (this is your `SUPABASE_SERVICE_ROLE_KEY`) - Keep this secret!

3. **Configure Environment Variables**
   - Copy `env.example` to `.env`
   - Add your Supabase credentials:
     ```env
     PORT=5000
     NODE_ENV=development
     
     SUPABASE_URL=https://your-project-id.supabase.co
     SUPABASE_ANON_KEY=your_anon_key_here
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
     ```
   - **Important:** Never commit your `.env` file to version control!

4. **Create Database Tables**
   - In your Supabase project dashboard, go to **SQL Editor**
   - Click **New Query**
   - Copy and paste the entire contents of `supabase-migration.sql`
   - Click **Run** (or press Ctrl+Enter)
   - Verify that all tables were created successfully in **Table Editor**

5. **Install Dependencies**
   ```bash
   npm install
   cd client
   npm install
   cd ..
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
This will start both the backend server (port 5000) and frontend development server (port 3000).

### Production Mode
```bash
npm run production
```

## 📁 Project Structure

```
personal-finance-tracker/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
├── server/                   # Node.js backend
│   ├── config/
│   │   └── database.js      # Supabase configuration
│   ├── routes/
│   │   ├── contexts.js
│   │   ├── transactions.js
│   │   ├── subscriptions.js
│   │   ├── savings.js
│   │   ├── budgets.js
│   │   ├── investments.js
│   │   ├── dashboard.js
│   │   └── export.js
│   └── index.js
├── package.json
├── README.md
├── supabase-migration.sql    # Database schema
└── env.example
```

## 🎨 UI/UX Features

### Design System
- **Modern, polished interface** with glass morphism effects
- **Responsive design** that works on all devices
- **Smooth animations** (fade-in, slide-up, bounce-in, float, glow, shimmer)
- **Hover effects** and interactive elements
- **Gradient backgrounds** and modern card designs

### Dynamic Theming
- **Home Theme**: Blue/cyan colors, 🏠 icon, "Welcome to Your Home Finance Hub"
- **Work Theme**: Gray/slate colors, 💼 icon, "Professional Finance Management"
- **Business Theme**: Purple/indigo colors, 🏢 icon, "Business Finance Command Center"

## 🗄 Database

The application uses **Supabase (PostgreSQL)** for cloud-based data storage with the following tables:
- `contexts` - Finance contexts (Home, Work, Business)
- `transactions` - Income and expense records
- `subscriptions` - Recurring subscription management
- `savings` - Savings goals and contributions
- `budgets` - Monthly spending limits by category
- `investments` - Investment portfolio tracking

All tables include proper foreign key relationships and indexes for optimal performance.

## 📊 Sample Data

The application automatically inserts sample data on first run if tables are empty:
- 3 contexts (My Home, Work Expenses, Main Business)
- Sample transactions across different categories
- Example subscriptions (Netflix, Spotify, Adobe, etc.)
- Sample savings goals (Emergency Fund, Vacation Fund, etc.)
- Budget examples for different categories
- Investment portfolio examples

## 🔧 API Endpoints

### Contexts
- `GET /api/contexts` - Get all contexts
- `POST /api/contexts` - Create new context
- `PUT /api/contexts/:id` - Update context
- `DELETE /api/contexts/:id` - Delete context

### Transactions
- `GET /api/transactions?context_id=:id` - Get transactions for context
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Subscriptions
- `GET /api/subscriptions?context_id=:id` - Get subscriptions for context
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

### Savings
- `GET /api/savings?context_id=:id` - Get savings for context
- `POST /api/savings` - Create new savings record
- `PUT /api/savings/:id` - Update savings record
- `DELETE /api/savings/:id` - Delete savings record

### Budgets
- `GET /api/budgets?context_id=:id&month=:month` - Get budgets for context and month
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Investments
- `GET /api/investments?context_id=:id` - Get investments for context
- `POST /api/investments` - Create new investment
- `PUT /api/investments/:id` - Update investment
- `DELETE /api/investments/:id` - Delete investment

### Dashboard
- `GET /api/dashboard?context_id=:id` - Get dashboard summary data

### Export/Import
- `GET /api/export?context_id=:id` - Export all data for a context
- `POST /api/export/import` - Import data from export file
- `GET /api/export/backup` - Create full database backup (JSON export)

### Health Check
- `GET /api/health` - Check database connection and configuration

## 🎯 Usage

1. **Create Contexts**: Start by creating different finance contexts (Home, Work, Business)
2. **Add Transactions**: Record your income and expenses with categories and accounts
3. **Manage Subscriptions**: Track recurring subscriptions and their billing dates
4. **Set Savings Goals**: Create savings accounts and track your progress
5. **Create Budgets**: Set monthly spending limits for different categories
6. **Track Investments**: Monitor your investment portfolio performance
7. **View Dashboard**: Get an overview of your financial health with interactive charts

## 🔒 Security

- Supabase PostgreSQL database with automatic backups
- Input validation on both client and server
- SQL injection prevention with parameterized queries
- XSS protection
- Environment variables for sensitive credentials
- Row Level Security (RLS) support (optional)
- Helmet.js for security headers
- Rate limiting to prevent abuse

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Performance

- Optimized bundle size (~188KB gzipped)
- Database indexes for fast queries
- Supabase connection pooling for scalability
- Gzip compression enabled
- Efficient React rendering with proper keys
- Rate limiting for API protection
- Input validation for data integrity
- Automatic database backups (daily)

## 🧪 Testing

Run the test suite:
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## 🔧 Development

### TypeScript Support
The project includes TypeScript configuration for better type safety and developer experience.

### Security Features
- Helmet.js for security headers
- Rate limiting to prevent abuse
- Input validation with express-validator
- CORS configuration for production

## 🐛 Troubleshooting

### Common 500 Internal Server Error Issues

#### 1. "Database tables not found" Error

**Symptoms:**
- 500 error when trying to fetch data
- Error message: "relation does not exist" or "PGRST116"

**Solution:**
1. Go to your Supabase dashboard
2. Click **SQL Editor** → **New Query**
3. Open `supabase-migration.sql` from this project
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **Run** (or Ctrl+Enter)
7. Verify tables were created: Go to **Table Editor** and check if tables exist

#### 2. Missing Environment Variables

**Symptoms:**
- Server crashes on startup
- Error: "Missing Supabase configuration"

**Solution:**
1. Make sure you have a `.env` file in the root directory
2. Copy from `env.example` if you don't have one:
   ```bash
   copy env.example .env
   ```
3. Add your Supabase credentials (see Setup section above)
4. Restart the server after updating `.env`

#### 3. Invalid Supabase Credentials

**Symptoms:**
- 500 errors on all API calls
- Connection errors in server logs

**Solution:**
1. Go to Supabase Dashboard → **Settings** → **API**
2. Verify your credentials:
   - **Project URL** should start with `https://` and end with `.supabase.co`
   - **anon key** should be a long JWT token
   - **service_role key** should be a different long JWT token
3. Copy them exactly (no extra spaces)
4. Make sure `.env` file has no quotes around values:
   ```env
   # ✅ Correct
   SUPABASE_URL=https://xxxxx.supabase.co
   
   # ❌ Wrong
   SUPABASE_URL="https://xxxxx.supabase.co"
   ```

#### 4. Supabase Project Paused

**Symptoms:**
- Connection timeouts
- 500 errors

**Solution:**
1. Go to Supabase Dashboard
2. Check if project status shows "Paused"
3. If paused, click "Restore" to reactivate
4. Wait a few minutes for project to be active

#### 5. Row Level Security (RLS) Enabled

**Symptoms:**
- 500 errors with permission denied messages
- Data not accessible

**Solution:**
1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Check if RLS is enabled on tables
3. Either:
   - Disable RLS (for development): Go to **Table Editor** → Select table → **Disable RLS**
   - Or create policies to allow access (see Supabase docs)

### Quick Diagnostic Steps

1. **Check `.env` file exists and has values:**
   ```bash
   # Windows
   type .env
   
   # Mac/Linux
   cat .env
   ```

2. **Verify Supabase project is active:**
   - Go to https://supabase.com/dashboard
   - Check project status

3. **Test API endpoint directly:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Or open in browser: http://localhost:5000/api/health

4. **Check Supabase logs:**
   - Go to Supabase Dashboard → **Logs** → **API Logs**
   - Look for errors from your requests

### Common Error Codes

- **PGRST116**: Table doesn't exist → Run SQL migration
- **PGRST301**: Invalid API key → Check credentials
- **42P01**: Relation does not exist → Run SQL migration
- **Connection timeout**: Project might be paused or URL is wrong

## 📄 License

MIT License

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📞 Support

For support or questions:
- Check the Troubleshooting section above
- Visit [Supabase Documentation](https://supabase.com/docs)
- Open an issue in the repository
