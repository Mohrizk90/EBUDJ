const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/export - Export all data for a context
router.get('/', async (req, res) => {
  try {
    const { context_id } = req.query;
    
    if (!context_id) {
      return res.status(400).json({ error: 'context_id is required' });
    }

    // Get all data for the context
    const { data: context, error: contextError } = await db.getSupabase()
      .from('contexts')
      .select('*')
      .eq('id', context_id)
      .single();
    
    if (contextError || !context) {
      return res.status(404).json({ error: 'Context not found' });
    }

    const { data: transactions } = await db.getSupabase()
      .from('transactions')
      .select('*')
      .eq('context_id', context_id)
      .order('date', { ascending: false });

    const { data: subscriptions } = await db.getSupabase()
      .from('subscriptions')
      .select('*')
      .eq('context_id', context_id)
      .order('service', { ascending: true });

    const { data: savings } = await db.getSupabase()
      .from('savings')
      .select('*')
      .eq('context_id', context_id)
      .order('account', { ascending: true });

    const { data: budgets } = await db.getSupabase()
      .from('budgets')
      .select('*')
      .eq('context_id', context_id)
      .order('month', { ascending: false })
      .order('category', { ascending: true });

    const { data: investments } = await db.getSupabase()
      .from('investments')
      .select('*')
      .eq('context_id', context_id)
      .order('asset_name', { ascending: true });

    const exportData = {
      exportDate: new Date().toISOString(),
      context: context,
      data: {
        transactions: transactions || [],
        subscriptions: subscriptions || [],
        savings: savings || [],
        budgets: budgets || [],
        investments: investments || []
      },
      summary: {
        totalTransactions: transactions?.length || 0,
        totalSubscriptions: subscriptions?.length || 0,
        totalSavings: savings?.length || 0,
        totalBudgets: budgets?.length || 0,
        totalInvestments: investments?.length || 0
      }
    };

    res.json(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// POST /api/export/import - Import data from export
router.post('/import', async (req, res) => {
  try {
    const { context_id, data } = req.body;
    
    if (!context_id || !data) {
      return res.status(400).json({ error: 'context_id and data are required' });
    }

    // Verify context exists
    const { data: context } = await db.getSupabase()
      .from('contexts')
      .select('id')
      .eq('id', context_id)
      .single();
    
    if (!context) {
      return res.status(404).json({ error: 'Context not found' });
    }

    const results = {
      imported: {
        transactions: 0,
        subscriptions: 0,
        savings: 0,
        budgets: 0,
        investments: 0
      },
      errors: []
    };

    // Import transactions
    if (data.transactions && Array.isArray(data.transactions)) {
      try {
        const transactionsToInsert = data.transactions.map(t => ({
          context_id,
          description: t.description,
          date: t.date,
          category: t.category,
          type: t.type,
          amount: t.amount,
          account: t.account,
          notes: t.notes || ''
        }));

        const { error: insertError } = await db.getSupabase()
          .from('transactions')
          .insert(transactionsToInsert);

        if (insertError) {
          results.errors.push(`Transaction import error: ${insertError.message}`);
        } else {
          results.imported.transactions = transactionsToInsert.length;
        }
      } catch (error) {
        results.errors.push(`Transaction import error: ${error.message}`);
      }
    }

    // Import subscriptions
    if (data.subscriptions && Array.isArray(data.subscriptions)) {
      try {
        const subscriptionsToInsert = data.subscriptions.map(s => ({
          context_id,
          service: s.service,
          amount: s.amount,
          frequency: s.frequency,
          next_billing_date: s.next_billing_date,
          status: s.status
        }));

        const { error: insertError } = await db.getSupabase()
          .from('subscriptions')
          .insert(subscriptionsToInsert);

        if (insertError) {
          results.errors.push(`Subscription import error: ${insertError.message}`);
        } else {
          results.imported.subscriptions = subscriptionsToInsert.length;
        }
      } catch (error) {
        results.errors.push(`Subscription import error: ${error.message}`);
      }
    }

    // Import savings
    if (data.savings && Array.isArray(data.savings)) {
      try {
        const savingsToInsert = data.savings.map(s => ({
          context_id,
          account: s.account,
          date: s.date,
          amount: s.amount,
          goal: s.goal,
          description: s.description || null
        }));

        const { error: insertError } = await db.getSupabase()
          .from('savings')
          .insert(savingsToInsert);

        if (insertError) {
          results.errors.push(`Savings import error: ${insertError.message}`);
        } else {
          results.imported.savings = savingsToInsert.length;
        }
      } catch (error) {
        results.errors.push(`Savings import error: ${error.message}`);
      }
    }

    // Import budgets
    if (data.budgets && Array.isArray(data.budgets)) {
      try {
        const budgetsToInsert = data.budgets.map(b => ({
          context_id,
          category: b.category,
          monthly_limit: b.monthly_limit,
          month: b.month,
          spent: b.spent || 0
        }));

        const { error: insertError } = await db.getSupabase()
          .from('budgets')
          .insert(budgetsToInsert);

        if (insertError) {
          results.errors.push(`Budget import error: ${insertError.message}`);
        } else {
          results.imported.budgets = budgetsToInsert.length;
        }
      } catch (error) {
        results.errors.push(`Budget import error: ${error.message}`);
      }
    }

    // Import investments
    if (data.investments && Array.isArray(data.investments)) {
      try {
        const investmentsToInsert = data.investments.map(i => ({
          context_id,
          asset_name: i.asset_name,
          type: i.type,
          amount_invested: i.amount_invested,
          current_value: i.current_value,
          date_invested: i.date_invested,
          notes: i.notes || ''
        }));

        const { error: insertError } = await db.getSupabase()
          .from('investments')
          .insert(investmentsToInsert);

        if (insertError) {
          results.errors.push(`Investment import error: ${insertError.message}`);
        } else {
          results.imported.investments = investmentsToInsert.length;
        }
      } catch (error) {
        results.errors.push(`Investment import error: ${error.message}`);
      }
    }

    res.json({
      message: 'Import completed',
      results: results
    });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// GET /api/export/backup - Create a full database backup (Supabase handles backups automatically)
router.get('/backup', async (req, res) => {
  try {
    // Supabase handles backups automatically, but we can export all data as JSON
    const { data: contexts } = await db.getSupabase()
      .from('contexts')
      .select('*');

    const allData = {
      exportDate: new Date().toISOString(),
      contexts: contexts || [],
      note: 'Supabase automatically handles database backups. This is a data export for manual backup purposes.'
    };

    res.json({
      message: 'Data export created successfully',
      data: allData,
      timestamp: new Date().toISOString(),
      note: 'Supabase provides automatic daily backups. This export is for manual backup purposes.'
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

module.exports = router;
