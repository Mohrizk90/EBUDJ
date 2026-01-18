import { createResource, createSignal, type Accessor } from 'solid-js';
import { supabase } from '../lib/supabase';
import type { Transaction, Budget, Savings, Investment, Subscription } from '../lib/types';

// Transactions hook
export function useTransactions(contextId: Accessor<number | null | undefined>) {
  const [data, { refetch, mutate }] = createResource(contextId, async (id) => {
    if (!id) return [];
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('context_id', id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  });

  return { data, refetch, mutate };
}

// Budgets hook
export function useBudgets(contextId: Accessor<number | null | undefined>) {
  const [data, { refetch, mutate }] = createResource(contextId, async (id) => {
    if (!id) return [];
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('context_id', id)
      .order('month', { ascending: false });
    
    if (error) throw error;
    return data || [];
  });

  return { data, refetch, mutate };
}

// Savings hook
export function useSavings(contextId: Accessor<number | null | undefined>) {
  const [data, { refetch, mutate }] = createResource(contextId, async (id) => {
    if (!id) return [];
    const { data, error } = await supabase
      .from('savings')
      .select('*')
      .eq('context_id', id)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  });

  return { data, refetch, mutate };
}

// Investments hook
export function useInvestments(contextId: Accessor<number | null | undefined>) {
  const [data, { refetch, mutate }] = createResource(contextId, async (id) => {
    if (!id) return [];
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('context_id', id)
      .order('date_invested', { ascending: false });
    
    if (error) throw error;
    return data || [];
  });

  return { data, refetch, mutate };
}

// Subscriptions hook
export function useSubscriptions(contextId: Accessor<number | null | undefined>) {
  const [data, { refetch, mutate }] = createResource(contextId, async (id) => {
    if (!id) return [];
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('context_id', id)
      .order('next_billing_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  });

  return { data, refetch, mutate };
}

// Dashboard data hook
export function useDashboardData(contextId: Accessor<number | null | undefined>) {
  const [data, { refetch }] = createResource(contextId, async (id) => {
    if (!id) return null;
    
    // Note: This uses multiple queries. In production, you'd want to create a PostgreSQL function
    // as shown in the plan (get_dashboard_data RPC)
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    const [incomeResult, expensesResult, transactionsResult, categoryResult] = await Promise.all([
      supabase
        .from('transactions')
        .select('amount')
        .eq('context_id', id)
        .eq('type', 'Income')
        .gte('date', `${currentMonth}-01`),
      
      supabase
        .from('transactions')
        .select('amount')
        .eq('context_id', id)
        .eq('type', 'Expense')
        .gte('date', `${currentMonth}-01`),
      
      supabase
        .from('transactions')
        .select('*')
        .eq('context_id', id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5),
      
      supabase
        .from('transactions')
        .select('category, amount')
        .eq('context_id', id)
        .eq('type', 'Expense')
        .gte('date', `${currentMonth}-01`)
    ]);
    
    const totalIncome = incomeResult.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const totalExpenses = expensesResult.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    
    // Group by category
    const categoryMap = new Map<string, number>();
    categoryResult.data?.forEach((t) => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + Number(t.amount));
    });
    
    const spendingByCategory = Array.from(categoryMap.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
    
    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      recentTransactions: transactionsResult.data || [],
      spendingByCategory,
    };
  });

  return { data, refetch };
}
