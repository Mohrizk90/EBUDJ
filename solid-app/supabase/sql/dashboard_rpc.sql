-- PostgreSQL RPC Function for optimized dashboard data retrieval
-- Run this in your Supabase SQL Editor to create the function

-- This function returns all dashboard data in a single optimized query
-- instead of making multiple separate queries from the client

CREATE OR REPLACE FUNCTION get_dashboard_data(p_context_id BIGINT)
RETURNS JSON AS $$
DECLARE
  result JSON;
  current_month_start DATE;
BEGIN
  -- Get first day of current month
  current_month_start := date_trunc('month', CURRENT_DATE)::DATE;
  
  SELECT json_build_object(
    -- Total income for current month
    'totalIncome', (
      SELECT COALESCE(SUM(amount), 0)
      FROM transactions
      WHERE context_id = p_context_id
        AND type = 'Income'
        AND date >= current_month_start
    ),
    
    -- Total expenses for current month
    'totalExpenses', (
      SELECT COALESCE(SUM(amount), 0)
      FROM transactions
      WHERE context_id = p_context_id
        AND type = 'Expense'
        AND date >= current_month_start
    ),
    
    -- Net income (calculated)
    'netIncome', (
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0)
      FROM transactions
      WHERE context_id = p_context_id
        AND date >= current_month_start
    ),
    
    -- Recent 5 transactions
    'recentTransactions', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', id,
          'description', description,
          'date', date,
          'category', category,
          'type', type,
          'amount', amount,
          'account', account,
          'notes', notes,
          'created_at', created_at
        )
      ), '[]'::json)
      FROM (
        SELECT *
        FROM transactions
        WHERE context_id = p_context_id
        ORDER BY date DESC, created_at DESC
        LIMIT 5
      ) t
    ),
    
    -- Spending by category for current month
    'spendingByCategory', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'category', category,
          'total', total
        ) ORDER BY total DESC
      ), '[]'::json)
      FROM (
        SELECT 
          category,
          SUM(amount) as total
        FROM transactions
        WHERE context_id = p_context_id
          AND type = 'Expense'
          AND date >= current_month_start
        GROUP BY category
        HAVING SUM(amount) > 0
        ORDER BY total DESC
      ) s
    ),
    
    -- Budget summary for current month
    'budgetSummary', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'category', category,
          'spent', spent,
          'limit', monthly_limit,
          'percentage', ROUND((spent / monthly_limit * 100)::numeric, 2)
        )
      ), '[]'::json)
      FROM budgets
      WHERE context_id = p_context_id
        AND month = to_char(CURRENT_DATE, 'YYYY-MM')
    ),
    
    -- Total savings progress
    'savingsSummary', (
      SELECT json_build_object(
        'totalSaved', COALESCE(SUM(amount), 0),
        'totalGoals', COALESCE(SUM(goal), 0),
        'percentage', CASE 
          WHEN SUM(goal) > 0 THEN ROUND((SUM(amount) / SUM(goal) * 100)::numeric, 2)
          ELSE 0
        END
      )
      FROM savings
      WHERE context_id = p_context_id
    ),
    
    -- Investment summary
    'investmentSummary', (
      SELECT json_build_object(
        'totalInvested', COALESCE(SUM(amount_invested), 0),
        'currentValue', COALESCE(SUM(current_value), 0),
        'totalReturn', COALESCE(SUM(current_value - amount_invested), 0),
        'returnPercentage', CASE 
          WHEN SUM(amount_invested) > 0 THEN 
            ROUND(((SUM(current_value) - SUM(amount_invested)) / SUM(amount_invested) * 100)::numeric, 2)
          ELSE 0
        END
      )
      FROM investments
      WHERE context_id = p_context_id
    ),
    
    -- Active subscriptions count and total monthly cost
    'subscriptionSummary', (
      SELECT json_build_object(
        'activeCount', COUNT(*),
        'monthlyCost', COALESCE(SUM(
          CASE 
            WHEN frequency = 'monthly' THEN amount
            WHEN frequency = 'yearly' THEN amount / 12
            WHEN frequency = 'weekly' THEN amount * 52 / 12
            WHEN frequency = 'daily' THEN amount * 365 / 12
            ELSE 0
          END
        ), 0)
      )
      FROM subscriptions
      WHERE context_id = p_context_id
        AND status = 'Active'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_dashboard_data(BIGINT) TO anon;
GRANT EXECUTE ON FUNCTION get_dashboard_data(BIGINT) TO authenticated;

-- Example usage:
-- SELECT get_dashboard_data(1);
