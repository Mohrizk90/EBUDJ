const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/dashboard?context_id=:id - Get dashboard summary data
router.get('/', async (req, res) => {
  try {
    const { context_id } = req.query;
    
    if (!context_id) {
      return res.status(400).json({ error: 'context_id is required' });
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const currentMonthStart = `${currentMonth}-01`;
    const currentMonthEnd = new Date(new Date(currentMonthStart).setMonth(new Date(currentMonthStart).getMonth() + 1)).toISOString().slice(0, 10);

    // Get total income and expenses for current month
    const { data: transactions } = await db.getSupabase()
      .from('transactions')
      .select('type, amount')
      .eq('context_id', context_id)
      .gte('date', currentMonthStart)
      .lt('date', currentMonthEnd);

    const incomeExpenses = transactions?.reduce((acc, t) => {
      if (!acc[t.type]) acc[t.type] = { type: t.type, total: 0 };
      acc[t.type].total += parseFloat(t.amount);
      return acc;
    }, {}) || {};

    // Get spending by category for current month
    const { data: expenseTransactions } = await db.getSupabase()
      .from('transactions')
      .select('category, amount')
      .eq('context_id', context_id)
      .eq('type', 'Expense')
      .gte('date', currentMonthStart)
      .lt('date', currentMonthEnd);

    const spendingByCategory = expenseTransactions?.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = { category: t.category, total: 0 };
      acc[t.category].total += parseFloat(t.amount);
      return acc;
    }, {}) || {};

    const spendingByCategoryArray = Object.values(spendingByCategory)
      .sort((a, b) => b.total - a.total);

    // Get total subscription costs
    const { data: subscriptions } = await db.getSupabase()
      .from('subscriptions')
      .select('amount')
      .eq('context_id', context_id)
      .eq('status', 'Active');

    const totalSubscriptions = subscriptions?.reduce((sum, s) => sum + parseFloat(s.amount), 0) || 0;

    // Get savings progress
    const { data: savings } = await db.getSupabase()
      .from('savings')
      .select('account, amount, goal')
      .eq('context_id', context_id);

    const savingsProgress = savings?.reduce((acc, s) => {
      if (!acc[s.account]) {
        acc[s.account] = { account: s.account, current_amount: 0, goal: 0 };
      }
      acc[s.account].current_amount += parseFloat(s.amount);
      acc[s.account].goal = Math.max(acc[s.account].goal, parseFloat(s.goal));
      return acc;
    }, {}) || {};

    const savingsProgressArray = Object.values(savingsProgress);

    // Get investment summary
    const { data: investments } = await db.getSupabase()
      .from('investments')
      .select('amount_invested, current_value')
      .eq('context_id', context_id);

    const investmentSummary = investments?.reduce((acc, inv) => {
      acc.total_invested += parseFloat(inv.amount_invested);
      acc.total_current_value += parseFloat(inv.current_value);
      acc.total_investments += 1;
      return acc;
    }, { total_invested: 0, total_current_value: 0, total_investments: 0 }) || { total_invested: 0, total_current_value: 0, total_investments: 0 };

    // Get budget vs actual spending
    const { data: budgets } = await db.getSupabase()
      .from('budgets')
      .select('category, monthly_limit')
      .eq('context_id', context_id)
      .eq('month', currentMonth);

    const budgetVsActual = await Promise.all(
      (budgets || []).map(async (budget) => {
        const { data: categoryTransactions } = await db.getSupabase()
          .from('transactions')
          .select('amount')
          .eq('context_id', context_id)
          .eq('category', budget.category)
          .eq('type', 'Expense')
          .gte('date', currentMonthStart)
          .lt('date', currentMonthEnd);

        const actualSpending = categoryTransactions?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

        return {
          category: budget.category,
          monthly_limit: parseFloat(budget.monthly_limit),
          actual_spending: actualSpending
        };
      })
    );

    // Get recent transactions (last 5)
    const { data: recentTransactions } = await db.getSupabase()
      .from('transactions')
      .select('*')
      .eq('context_id', context_id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    // Get upcoming subscription renewals (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const thirtyDaysFromNowStr = thirtyDaysFromNow.toISOString().slice(0, 10);

    const { data: upcomingRenewals } = await db.getSupabase()
      .from('subscriptions')
      .select('*')
      .eq('context_id', context_id)
      .eq('status', 'Active')
      .lte('next_billing_date', thirtyDaysFromNowStr)
      .order('next_billing_date', { ascending: true })
      .limit(5);

    // Calculate profit/loss for investments
    const profitLoss = investmentSummary.total_current_value - investmentSummary.total_invested;
    const profitLossPercentage = investmentSummary.total_invested > 0
      ? ((profitLoss / investmentSummary.total_invested) * 100)
      : 0;

    // Process income/expenses data
    const income = incomeExpenses.Income?.total || 0;
    const expenses = incomeExpenses.Expense?.total || 0;
    const netIncome = income - expenses;

    res.json({
      summary: {
        totalIncome: income,
        totalExpenses: expenses,
        netIncome: netIncome,
        totalSubscriptions: totalSubscriptions,
        totalInvested: investmentSummary.total_invested,
        totalCurrentValue: investmentSummary.total_current_value,
        profitLoss: profitLoss,
        profitLossPercentage: profitLossPercentage
      },
      spendingByCategory: spendingByCategoryArray,
      savingsProgress: savingsProgressArray,
      budgetVsActual,
      recentTransactions: recentTransactions || [],
      upcomingRenewals: upcomingRenewals || [],
      currentMonth
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
