-- Supabase Migration Script
-- Run this script in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contexts table
CREATE TABLE IF NOT EXISTS contexts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Home', 'Work', 'Business')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  context_id BIGINT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
  amount NUMERIC(10, 2) NOT NULL,
  account TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (context_id) REFERENCES contexts (id) ON DELETE CASCADE
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGSERIAL PRIMARY KEY,
  context_id BIGINT NOT NULL,
  service TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'yearly', 'weekly', 'daily')),
  next_billing_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Paused', 'Cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (context_id) REFERENCES contexts (id) ON DELETE CASCADE
);

-- Savings table
CREATE TABLE IF NOT EXISTS savings (
  id BIGSERIAL PRIMARY KEY,
  context_id BIGINT NOT NULL,
  account TEXT NOT NULL,
  date DATE,
  amount NUMERIC(10, 2) NOT NULL,
  goal NUMERIC(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (context_id) REFERENCES contexts (id) ON DELETE CASCADE
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id BIGSERIAL PRIMARY KEY,
  context_id BIGINT NOT NULL,
  category TEXT NOT NULL,
  monthly_limit NUMERIC(10, 2) NOT NULL,
  month TEXT NOT NULL,
  spent NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (context_id) REFERENCES contexts (id) ON DELETE CASCADE
);

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
  id BIGSERIAL PRIMARY KEY,
  context_id BIGINT NOT NULL,
  asset_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Stock', 'Bond', 'Mutual Fund', 'ETF', 'Crypto', 'Real Estate', 'Commodity', 'REIT', 'Options', 'Futures', 'Forex', 'Other')),
  amount_invested NUMERIC(10, 2) NOT NULL,
  current_value NUMERIC(10, 2) NOT NULL,
  date_invested DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (context_id) REFERENCES contexts (id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_context_id ON transactions(context_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_context_id ON subscriptions(context_id);
CREATE INDEX IF NOT EXISTS idx_savings_context_id ON savings(context_id);
CREATE INDEX IF NOT EXISTS idx_budgets_context_id ON budgets(context_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
CREATE INDEX IF NOT EXISTS idx_investments_context_id ON investments(context_id);

-- Create default context if none exists
INSERT INTO contexts (name, type)
SELECT 'Personal', 'Home'
WHERE NOT EXISTS (SELECT 1 FROM contexts);

-- Enable Row Level Security (RLS) - Optional: Configure based on your auth needs
-- ALTER TABLE contexts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE savings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- If you want to use RLS, you'll need to create policies
-- Example policy (adjust based on your authentication setup):
-- CREATE POLICY "Allow all operations for service role" ON contexts FOR ALL USING (true);
-- CREATE POLICY "Allow all operations for service role" ON transactions FOR ALL USING (true);
-- CREATE POLICY "Allow all operations for service role" ON subscriptions FOR ALL USING (true);
-- CREATE POLICY "Allow all operations for service role" ON savings FOR ALL USING (true);
-- CREATE POLICY "Allow all operations for service role" ON budgets FOR ALL USING (true);
-- CREATE POLICY "Allow all operations for service role" ON investments FOR ALL USING (true);
