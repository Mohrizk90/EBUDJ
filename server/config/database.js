const Database = require('better-sqlite3');
const path = require('path');

class DatabaseService {
  constructor() {
    this.db = new Database(path.join(__dirname, '../../finance.db'));
    this.initializeDatabase();
  }

  initializeDatabase() {
    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('cache_size = 1000');
    this.db.pragma('temp_store = memory');

    // Create tables
    this.createTables();
    
    // Run migrations
    this.runMigrations();
    
    // Insert sample data if tables are empty
    this.insertSampleData();
  }

  createTables() {
    // Contexts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS contexts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('Home', 'Work', 'Business')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Transactions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        context_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
        amount REAL NOT NULL,
        account TEXT NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (context_id) REFERENCES contexts (id) ON DELETE CASCADE
      )
    `);

    // Add description column to existing transactions table if it doesn't exist
    try {
      this.db.exec(`ALTER TABLE transactions ADD COLUMN description TEXT`);
    } catch (error) {
      // Column already exists, ignore error
    }

    // Create default context if none exists
    const existingContexts = this.db.prepare('SELECT COUNT(*) as count FROM contexts').get();
    if (existingContexts.count === 0) {
      this.db.prepare('INSERT INTO contexts (name, type) VALUES (?, ?)').run('Personal', 'Home');
      console.log('Created default context: Personal (Home)');
    }

    // Subscriptions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        context_id INTEGER NOT NULL,
        service TEXT NOT NULL,
        amount REAL NOT NULL,
        frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'yearly', 'weekly', 'daily')),
        next_billing_date TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('Active', 'Paused', 'Cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (context_id) REFERENCES contexts (id) ON DELETE CASCADE
      )
    `);

    // Savings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS savings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        context_id INTEGER NOT NULL,
        account TEXT NOT NULL,
        date TEXT,
        amount REAL NOT NULL,
        goal REAL NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (context_id) REFERENCES contexts (id) ON DELETE CASCADE
      )
    `);

    // Budgets table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        context_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        monthly_limit REAL NOT NULL,
        month TEXT NOT NULL,
        spent REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (context_id) REFERENCES contexts (id) ON DELETE CASCADE
      )
    `);

    // Investments table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        context_id INTEGER NOT NULL,
        asset_name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('Stock', 'Bond', 'Mutual Fund', 'ETF', 'Crypto', 'Real Estate', 'Commodity', 'REIT', 'Options', 'Futures', 'Forex', 'Other')),
        amount_invested REAL NOT NULL,
        current_value REAL NOT NULL,
        date_invested TEXT NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (context_id) REFERENCES contexts (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_transactions_context_id ON transactions(context_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_context_id ON subscriptions(context_id);
      CREATE INDEX IF NOT EXISTS idx_savings_context_id ON savings(context_id);
      CREATE INDEX IF NOT EXISTS idx_budgets_context_id ON budgets(context_id);
      CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
      CREATE INDEX IF NOT EXISTS idx_investments_context_id ON investments(context_id);
    `);
  }

  runMigrations() {
    try {
      // Add description column to savings table if it doesn't exist
      const savingsColumns = this.db.prepare("PRAGMA table_info(savings)").all();
      const hasDescription = savingsColumns.some(col => col.name === 'description');
      
      if (!hasDescription) {
        console.log('Adding description column to savings table...');
        this.db.exec('ALTER TABLE savings ADD COLUMN description TEXT');
      }

      // Make date column nullable in savings table if it's not already
      const dateColumn = savingsColumns.find(col => col.name === 'date');
      if (dateColumn && dateColumn.notnull === 1) {
        console.log('Making date column nullable in savings table...');
        // SQLite doesn't support ALTER COLUMN, so we need to recreate the table
        this.db.exec(`
          CREATE TABLE savings_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            context_id INTEGER NOT NULL,
            account TEXT NOT NULL,
            date TEXT,
            amount REAL NOT NULL,
            goal REAL NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (context_id) REFERENCES contexts (id) ON DELETE CASCADE
          )
        `);
        
        this.db.exec(`
          INSERT INTO savings_new (id, context_id, account, date, amount, goal, created_at)
          SELECT id, context_id, account, date, amount, goal, created_at FROM savings
        `);
        
        this.db.exec('DROP TABLE savings');
        this.db.exec('ALTER TABLE savings_new RENAME TO savings');
      }

      // Add spent column to budgets table if it doesn't exist
      const budgetsColumns = this.db.prepare("PRAGMA table_info(budgets)").all();
      console.log('Budget table columns:', budgetsColumns);
      const hasSpent = budgetsColumns.some(col => col.name === 'spent');
      
      if (!hasSpent) {
        console.log('Adding spent column to budgets table...');
        this.db.exec('ALTER TABLE budgets ADD COLUMN spent REAL DEFAULT 0');
        console.log('Spent column added successfully');
      } else {
        console.log('Spent column already exists in budgets table');
      }

      // Update investments table schema if needed (for new investment types)
      const investmentsColumns = this.db.prepare("PRAGMA table_info(investments)").all();
      console.log('Investments table columns:', investmentsColumns);
      
      // Check if we need to update the investment types constraint
      // This would require recreating the table with the new CHECK constraint
      // For now, we'll let the application handle type validation
    } catch (error) {
      console.error('Migration error:', error);
    }
  }

  insertSampleData() {
    // Check if contexts table is empty
    const contextCount = this.db.prepare('SELECT COUNT(*) as count FROM contexts').get();
    
    if (contextCount.count === 0) {
      console.log('📊 Inserting sample data...');
      
      // Insert sample contexts
      const insertContext = this.db.prepare(`
        INSERT INTO contexts (name, type) VALUES (?, ?)
      `);
      
      const contexts = [
        ['My Home', 'Home'],
        ['Work Expenses', 'Work'],
        ['Main Business', 'Business']
      ];
      
      contexts.forEach(([name, type]) => {
        insertContext.run(name, type);
      });

      // Insert sample transactions
      const insertTransaction = this.db.prepare(`
        INSERT INTO transactions (context_id, date, category, type, amount, account, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const transactions = [
        [1, '2024-01-15', 'Salary', 'Income', 5000, 'Checking', 'Monthly salary'],
        [1, '2024-01-16', 'Food & Dining', 'Expense', 45.50, 'Credit Card', 'Grocery shopping'],
        [1, '2024-01-17', 'Transportation', 'Expense', 25.00, 'Debit Card', 'Gas'],
        [2, '2024-01-18', 'Professional Development', 'Expense', 299.00, 'Business Card', 'Online course'],
        [2, '2024-01-19', 'Client Work', 'Income', 2500, 'Business Account', 'Project payment'],
        [3, '2024-01-20', 'Office Supplies', 'Expense', 150.00, 'Business Card', 'Office materials'],
        [3, '2024-01-21', 'Business Revenue', 'Income', 8000, 'Business Account', 'Monthly revenue']
      ];

      transactions.forEach(([contextId, date, category, type, amount, account, notes]) => {
        insertTransaction.run(contextId, date, category, type, amount, account, notes);
      });

      // Insert sample subscriptions
      const insertSubscription = this.db.prepare(`
        INSERT INTO subscriptions (context_id, service, amount, frequency, next_billing_date, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const subscriptions = [
        [1, 'Netflix', 15.99, 'monthly', '2024-02-15', 'Active'],
        [1, 'Spotify', 9.99, 'monthly', '2024-02-10', 'Active'],
        [2, 'Adobe Creative Suite', 52.99, 'monthly', '2024-02-05', 'Active'],
        [3, 'Office 365 Business', 12.50, 'monthly', '2024-02-20', 'Active']
      ];

      subscriptions.forEach(([contextId, service, amount, frequency, nextBillingDate, status]) => {
        insertSubscription.run(contextId, service, amount, frequency, nextBillingDate, status);
      });

      // Insert sample savings
      const insertSaving = this.db.prepare(`
        INSERT INTO savings (context_id, account, date, amount, goal)
        VALUES (?, ?, ?, ?, ?)
      `);

      const savings = [
        [1, 'Emergency Fund', '2024-01-15', 500, 10000],
        [1, 'Vacation Fund', '2024-01-15', 200, 5000],
        [1, 'Retirement', '2024-01-15', 1000, 100000],
        [3, 'Business Expansion', '2024-01-15', 2000, 50000]
      ];

      savings.forEach(([contextId, account, date, amount, goal]) => {
        insertSaving.run(contextId, account, date, amount, goal);
      });

      // Insert sample budgets
      const insertBudget = this.db.prepare(`
        INSERT INTO budgets (context_id, category, monthly_limit, month)
        VALUES (?, ?, ?, ?)
      `);

      const budgets = [
        [1, 'Food & Dining', 800, '2024-01'],
        [1, 'Transportation', 300, '2024-01'],
        [1, 'Entertainment', 200, '2024-01'],
        [2, 'Professional Development', 500, '2024-01'],
        [3, 'Office Supplies', 1000, '2024-01']
      ];

      budgets.forEach(([contextId, category, monthlyLimit, month]) => {
        insertBudget.run(contextId, category, monthlyLimit, month);
      });

      // Insert sample investments
      const insertInvestment = this.db.prepare(`
        INSERT INTO investments (context_id, asset_name, type, amount_invested, current_value, date_invested, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const investments = [
        [1, 'Apple Stock', 'Stock', 5000, 5200, '2024-01-01', 'AAPL shares'],
        [1, 'Bitcoin', 'Crypto', 3000, 3200, '2024-01-05', 'BTC investment'],
        [1, 'S&P 500 Index Fund', 'Mutual Fund', 10000, 10200, '2024-01-10', 'Vanguard fund'],
        [3, 'Commercial Property', 'Property', 100000, 105000, '2024-01-15', 'Office building']
      ];

      investments.forEach(([contextId, assetName, type, amountInvested, currentValue, dateInvested, notes]) => {
        insertInvestment.run(contextId, assetName, type, amountInvested, currentValue, dateInvested, notes);
      });

      console.log('✅ Sample data inserted successfully!');
    }
  }

  getDb() {
    return this.db;
  }

  close() {
    this.db.close();
  }
}

module.exports = new DatabaseService();
