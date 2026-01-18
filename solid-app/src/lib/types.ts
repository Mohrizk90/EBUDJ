// Database types
export interface Context {
  id: number;
  name: string;
  type: 'Home' | 'Work' | 'Business';
  created_at: string;
}

export interface Transaction {
  id: number;
  context_id: number;
  description: string;
  date: string;
  category: string;
  type: 'Income' | 'Expense';
  amount: number;
  account: string;
  notes?: string;
  created_at: string;
}

export interface Budget {
  id: number;
  context_id: number;
  category: string;
  monthly_limit: number;
  month: string;
  spent: number;
  created_at: string;
}

export interface Savings {
  id: number;
  context_id: number;
  account: string;
  date: string;
  amount: number;
  goal: number;
  description?: string;
  created_at: string;
}

export interface Investment {
  id: number;
  context_id: number;
  asset_name: string;
  type: 'Stock' | 'Bond' | 'Mutual Fund' | 'ETF' | 'Crypto' | 'Real Estate' | 'Commodity' | 'REIT' | 'Options' | 'Futures' | 'Forex' | 'Other';
  amount_invested: number;
  current_value: number;
  date_invested: string;
  notes?: string;
  created_at: string;
}

export interface Subscription {
  id: number;
  context_id: number;
  service: string;
  amount: number;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'daily';
  next_billing_date: string;
  status: 'Active' | 'Paused' | 'Cancelled';
  created_at: string;
}

export interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  recentTransactions: Transaction[];
  spendingByCategory: { category: string; total: number }[];
}

// Database schema type for Supabase
export interface Database {
  public: {
    Tables: {
      contexts: {
        Row: Context;
        Insert: Omit<Context, 'id' | 'created_at'>;
        Update: Partial<Omit<Context, 'id' | 'created_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'created_at'>>;
      };
      budgets: {
        Row: Budget;
        Insert: Omit<Budget, 'id' | 'created_at' | 'spent'> & { spent?: number };
        Update: Partial<Omit<Budget, 'id' | 'created_at'>>;
      };
      savings: {
        Row: Savings;
        Insert: Omit<Savings, 'id' | 'created_at'>;
        Update: Partial<Omit<Savings, 'id' | 'created_at'>>;
      };
      investments: {
        Row: Investment;
        Insert: Omit<Investment, 'id' | 'created_at'>;
        Update: Partial<Omit<Investment, 'id' | 'created_at'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at'>;
        Update: Partial<Omit<Subscription, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
