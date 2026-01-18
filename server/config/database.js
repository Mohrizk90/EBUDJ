const { createClient } = require('@supabase/supabase-js');

class DatabaseService {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase configuration!');
      console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY in your .env file');
      throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY in your .env file');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    // Initialize database asynchronously without blocking
    this.initializeDatabase().catch(err => {
      console.error('❌ Database initialization failed:', err.message);
      console.error('This might be normal if tables are not created yet.');
    });
  }

  async initializeDatabase() {
    try {
      // Check if tables exist and create them if needed
      await this.createTables();
      
      // Insert sample data if contexts table is empty
      await this.insertSampleData();
      
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async createTables() {
    // Note: Table creation should be done via Supabase SQL editor or migrations
    // This is a placeholder that checks if tables exist
    // The actual schema creation should be done using the SQL migration file
    console.log('📊 Database tables should be created via Supabase SQL editor');
  }

  async insertSampleData() {
    try {
      // Check if contexts table is empty
      const { data: contexts, error: contextsError } = await this.supabase
        .from('contexts')
        .select('id')
        .limit(1);

      if (contextsError) {
        // Check for common error codes
        if (contextsError.code === 'PGRST116' || contextsError.message?.includes('relation') || contextsError.message?.includes('does not exist')) {
          console.log('⚠️  Tables not created yet. Please run the SQL migration script in Supabase SQL editor.');
          console.log('   Run the SQL from: supabase-migration.sql');
          return;
        }
        // Other errors - log them
        console.error('⚠️  Error checking contexts table:', contextsError.message);
        console.error('   Code:', contextsError.code);
        console.error('   Details:', contextsError);
        return;
      }

      if (contexts && contexts.length === 0) {
        console.log('📊 Inserting sample data...');
        
        // Insert sample contexts
        const sampleContexts = [
          { name: 'My Home', type: 'Home' },
          { name: 'Work Expenses', type: 'Work' },
          { name: 'Main Business', type: 'Business' }
        ];

        const { data: insertedContexts, error: insertError } = await this.supabase
          .from('contexts')
          .insert(sampleContexts)
          .select();

        if (insertError) {
          console.error('Error inserting sample contexts:', insertError);
          return;
        }

        if (insertedContexts && insertedContexts.length > 0) {
          const context1Id = insertedContexts[0].id;
          const context2Id = insertedContexts[1]?.id || context1Id;
          const context3Id = insertedContexts[2]?.id || context1Id;

          // Insert sample transactions
          const sampleTransactions = [
            { context_id: context1Id, description: 'Monthly salary', date: '2024-01-15', category: 'Salary', type: 'Income', amount: 5000, account: 'Checking', notes: 'Monthly salary' },
            { context_id: context1Id, description: 'Grocery shopping', date: '2024-01-16', category: 'Food & Dining', type: 'Expense', amount: 45.50, account: 'Credit Card', notes: 'Grocery shopping' },
            { context_id: context1Id, description: 'Gas', date: '2024-01-17', category: 'Transportation', type: 'Expense', amount: 25.00, account: 'Debit Card', notes: 'Gas' },
            { context_id: context2Id, description: 'Online course', date: '2024-01-18', category: 'Professional Development', type: 'Expense', amount: 299.00, account: 'Business Card', notes: 'Online course' },
            { context_id: context2Id, description: 'Project payment', date: '2024-01-19', category: 'Client Work', type: 'Income', amount: 2500, account: 'Business Account', notes: 'Project payment' },
            { context_id: context3Id, description: 'Office materials', date: '2024-01-20', category: 'Office Supplies', type: 'Expense', amount: 150.00, account: 'Business Card', notes: 'Office materials' },
            { context_id: context3Id, description: 'Monthly revenue', date: '2024-01-21', category: 'Business Revenue', type: 'Income', amount: 8000, account: 'Business Account', notes: 'Monthly revenue' }
          ];

          await this.supabase.from('transactions').insert(sampleTransactions);

          // Insert sample subscriptions
          const sampleSubscriptions = [
            { context_id: context1Id, service: 'Netflix', amount: 15.99, frequency: 'monthly', next_billing_date: '2024-02-15', status: 'Active' },
            { context_id: context1Id, service: 'Spotify', amount: 9.99, frequency: 'monthly', next_billing_date: '2024-02-10', status: 'Active' },
            { context_id: context2Id, service: 'Adobe Creative Suite', amount: 52.99, frequency: 'monthly', next_billing_date: '2024-02-05', status: 'Active' },
            { context_id: context3Id, service: 'Office 365 Business', amount: 12.50, frequency: 'monthly', next_billing_date: '2024-02-20', status: 'Active' }
          ];

          await this.supabase.from('subscriptions').insert(sampleSubscriptions);

          // Insert sample savings
          const sampleSavings = [
            { context_id: context1Id, account: 'Emergency Fund', date: '2024-01-15', amount: 500, goal: 10000 },
            { context_id: context1Id, account: 'Vacation Fund', date: '2024-01-15', amount: 200, goal: 5000 },
            { context_id: context1Id, account: 'Retirement', date: '2024-01-15', amount: 1000, goal: 100000 },
            { context_id: context3Id, account: 'Business Expansion', date: '2024-01-15', amount: 2000, goal: 50000 }
          ];

          await this.supabase.from('savings').insert(sampleSavings);

          // Insert sample budgets
          const sampleBudgets = [
            { context_id: context1Id, category: 'Food & Dining', monthly_limit: 800, month: '2024-01', spent: 0 },
            { context_id: context1Id, category: 'Transportation', monthly_limit: 300, month: '2024-01', spent: 0 },
            { context_id: context1Id, category: 'Entertainment', monthly_limit: 200, month: '2024-01', spent: 0 },
            { context_id: context2Id, category: 'Professional Development', monthly_limit: 500, month: '2024-01', spent: 0 },
            { context_id: context3Id, category: 'Office Supplies', monthly_limit: 1000, month: '2024-01', spent: 0 }
          ];

          await this.supabase.from('budgets').insert(sampleBudgets);

          // Insert sample investments
          const sampleInvestments = [
            { context_id: context1Id, asset_name: 'Apple Stock', type: 'Stock', amount_invested: 5000, current_value: 5200, date_invested: '2024-01-01', notes: 'AAPL shares' },
            { context_id: context1Id, asset_name: 'Bitcoin', type: 'Crypto', amount_invested: 3000, current_value: 3200, date_invested: '2024-01-05', notes: 'BTC investment' },
            { context_id: context1Id, asset_name: 'S&P 500 Index Fund', type: 'Mutual Fund', amount_invested: 10000, current_value: 10200, date_invested: '2024-01-10', notes: 'Vanguard fund' },
            { context_id: context3Id, asset_name: 'Commercial Property', type: 'Real Estate', amount_invested: 100000, current_value: 105000, date_invested: '2024-01-15', notes: 'Office building' }
          ];

          await this.supabase.from('investments').insert(sampleInvestments);

          console.log('✅ Sample data inserted successfully!');
        }
      }
    } catch (error) {
      console.error('Error inserting sample data:', error);
    }
  }

  getSupabase() {
    return this.supabase;
  }

  // Legacy method for compatibility - returns supabase client
  getDb() {
    return this.supabase;
  }
}

module.exports = new DatabaseService();
