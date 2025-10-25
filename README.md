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
- Full database backup functionality
- Data validation and error handling

### Security & Performance
- Input validation with express-validator
- Rate limiting and security headers with Helmet
- Comprehensive test suite with Jest
- Optimized database queries with indexes

## 🛠 Tech Stack

- **Frontend**: React 18.3 + TypeScript + Tailwind CSS + Recharts
- **Backend**: Node.js 20 + Express 4.19
- **Database**: SQLite with better-sqlite3
- **Charts**: Recharts for data visualization
- **Testing**: Jest + Supertest
- **Security**: Helmet, Rate Limiting, Input Validation
- **Features**: Dark Mode, Export/Import, Data Backup
- **Deployment**: Local production setup

## 🧹 Project Cleanup

This project has been thoroughly cleaned and optimized:

### Removed Files
- **Temporary Documentation**: All development status files removed
- **Unused Components**: LoadingStates.js, api-service.js, api-client.js
- **Unused Providers**: QueryProvider.js (React Query integration)
- **Unused Utilities**: themes.js
- **Duplicate Files**: TransactionsPage.js (duplicate of Transactions.js)
- **Build Artifacts**: Production build directory removed

### Optimized Structure
- **Clean Architecture**: Only essential files remain
- **Efficient Imports**: All imports verified and optimized
- **No Dead Code**: All unused code removed
- **Production Ready**: Clean, maintainable codebase

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm

### Quick Setup (Windows)
1. Run the setup script:
   ```bash
   setup.bat
   ```

### Manual Setup
1. Install backend dependencies:
   ```bash
   npm install
   ```

2. Install frontend dependencies:
   ```bash
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
Or use the Windows batch script:
```bash
start-production.bat
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
│   │   ├── utils/           # Utilities
│   │   ├── services/        # API services
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
├── server/                   # Node.js backend
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   ├── contexts.js
│   │   ├── transactions.js
│   │   ├── subscriptions.js
│   │   ├── savings.js
│   │   ├── budgets.js
│   │   ├── investments.js
│   │   └── dashboard.js
│   └── index.js
├── package.json
├── README.md
├── setup.bat                # Windows setup script
├── start-production.bat     # Windows production script
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

The application uses SQLite for local data storage with the following tables:
- `contexts` - Finance contexts (Home, Work, Business)
- `transactions` - Income and expense records
- `subscriptions` - Recurring subscription management
- `savings` - Savings goals and contributions
- `budgets` - Monthly spending limits by category
- `investments` - Investment portfolio tracking

## 📊 Sample Data

The application comes with sample data including:
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
- `GET /api/export/backup` - Create full database backup

## 🎯 Usage

1. **Create Contexts**: Start by creating different finance contexts (Home, Work, Business)
2. **Add Transactions**: Record your income and expenses with categories and accounts
3. **Manage Subscriptions**: Track recurring subscriptions and their billing dates
4. **Set Savings Goals**: Create savings accounts and track your progress
5. **Create Budgets**: Set monthly spending limits for different categories
6. **Track Investments**: Monitor your investment portfolio performance
7. **View Dashboard**: Get an overview of your financial health with interactive charts

## 🔒 Security

- Local SQLite database (no external dependencies)
- Input validation on both client and server
- SQL injection prevention with prepared statements
- XSS protection
- No sensitive data in client-side code

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Performance

- Optimized bundle size (~188KB gzipped)
- Database indexes for fast queries
- WAL mode for better concurrency
- Gzip compression enabled
- Efficient React rendering with proper keys
- Rate limiting for API protection
- Input validation for data integrity

## 🧪 Testing

Run the test suite:
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## 🔧 Development

### TypeScript Support
The project now includes TypeScript configuration for better type safety and developer experience.

### Security Features
- Helmet.js for security headers
- Rate limiting to prevent abuse
- Input validation with express-validator
- CORS configuration for production

## 📄 License

MIT License

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📞 Support

For support or questions, please open an issue in the repository.
