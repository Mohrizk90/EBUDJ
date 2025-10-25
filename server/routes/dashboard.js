const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/dashboard?context_id=:id - Get dashboard summary data
router.get('/', (req, res) => {
  try {
    const { context_id } = req.query;
    
    if (!context_id) {
      return res.status(400).json({ error: 'context_id is required' });
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    // Get total income and expenses for current month
    const incomeExpenses = db.getDb().prepare(`
      SELECT 
        type,
        SUM(amount) as total
      FROM transactions 
      WHERE context_id = ? AND strftime('%Y-%m', date) = ?
      GROUP BY type
    `).all(context_id, currentMonth);

    // Get spending by category for current month
    const spendingByCategory = db.getDb().prepare(`
      SELECT 
        category,
        SUM(amount) as total
      FROM transactions 
      WHERE context_id = ? AND type = 'Expense' AND strftime('%Y-%m', date) = ?
      GROUP BY category
      ORDER BY total DESC
    `).all(context_id, currentMonth);

    // Get total subscription costs
    const totalSubscriptions = db.getDb().prepare(`
      SELECT SUM(amount) as total
      FROM subscriptions 
      WHERE context_id = ? AND status = 'Active'
    `).get(context_id);

    // Get savings progress
    const savingsProgress = db.getDb().prepare(`
      SELECT 
        account,
        SUM(amount) as current_amount,
        MAX(goal) as goal
      FROM savings 
      WHERE context_id = ?
      GROUP BY account
    `).all(context_id);

    // Get investment summary
    const investmentSummary = db.getDb().prepare(`
      SELECT 
        SUM(amount_invested) as total_invested,
        SUM(current_value) as total_current_value,
        COUNT(*) as total_investments
      FROM investments 
      WHERE context_id = ?
    `).get(context_id);

    // Get budget vs actual spending
    const budgetVsActual = db.getDb().prepare(`
      SELECT 
        b.category,
        b.monthly_limit,
        COALESCE(SUM(t.amount), 0) as actual_spending
      FROM budgets b
      LEFT JOIN transactions t ON b.context_id = t.context_id 
        AND b.category = t.category 
        AND t.type = 'Expense'
        AND strftime('%Y-%m', t.date) = b.month
      WHERE b.context_id = ? AND b.month = ?
      GROUP BY b.category, b.monthly_limit
    `).all(context_id, currentMonth);

    // Get recent transactions (last 5)
    const recentTransactions = db.getDb().prepare(`
      SELECT * FROM transactions 
      WHERE context_id = ? 
      ORDER BY date DESC, created_at DESC 
      LIMIT 5
    `).all(context_id);

    // Get upcoming subscription renewals (next 30 days)
    const upcomingRenewals = db.getDb().prepare(`
      SELECT * FROM subscriptions 
      WHERE context_id = ? AND status = 'Active'
        AND date(next_billing_date) <= date('now', '+30 days')
      ORDER BY next_billing_date ASC
      LIMIT 5
    `).all(context_id);

    // Calculate profit/loss for investments
    const profitLoss = investmentSummary ? 
      investmentSummary.total_current_value - investmentSummary.total_invested : 0;
    const profitLossPercentage = investmentSummary && investmentSummary.total_invested > 0 ?
      ((profitLoss / investmentSummary.total_invested) * 100) : 0;

    // Process income/expenses data
    const income = incomeExpenses.find(item => item.type === 'Income')?.total || 0;
    const expenses = incomeExpenses.find(item => item.type === 'Expense')?.total || 0;
    const netIncome = income - expenses;

    res.json({
      summary: {
        totalIncome: income,
        totalExpenses: expenses,
        netIncome: netIncome,
        totalSubscriptions: totalSubscriptions?.total || 0,
        totalInvested: investmentSummary?.total_invested || 0,
        totalCurrentValue: investmentSummary?.total_current_value || 0,
        profitLoss: profitLoss,
        profitLossPercentage: profitLossPercentage
      },
      spendingByCategory,
      savingsProgress,
      budgetVsActual,
      recentTransactions,
      upcomingRenewals,
      currentMonth
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
