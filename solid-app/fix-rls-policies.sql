-- Fix Row Level Security for Personal Finance Tracker
-- Run this in your Supabase SQL Editor

-- Disable RLS on all tables (for development/personal use without auth)
ALTER TABLE contexts DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE savings DISABLE ROW LEVEL SECURITY;
ALTER TABLE investments DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies (if any)
DROP POLICY IF EXISTS "Allow all operations" ON contexts;
DROP POLICY IF EXISTS "Allow all operations" ON transactions;
DROP POLICY IF EXISTS "Allow all operations" ON budgets;
DROP POLICY IF EXISTS "Allow all operations" ON savings;
DROP POLICY IF EXISTS "Allow all operations" ON investments;
DROP POLICY IF EXISTS "Allow all operations" ON subscriptions;

-- Alternatively, if you want to keep RLS enabled but allow all operations:
-- Uncomment the following lines instead of disabling RLS above

-- ALTER TABLE contexts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE savings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all operations" ON contexts FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations" ON transactions FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations" ON budgets FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations" ON savings FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations" ON investments FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations" ON subscriptions FOR ALL USING (true) WITH CHECK (true);
