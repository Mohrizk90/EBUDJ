const express = require('express');
const router = express.Router();
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// GET /api/export - Export all data for a context
router.get('/', async (req, res) => {
  try {
    const { context_id } = req.query;
    
    if (!context_id) {
      return res.status(400).json({ error: 'context_id is required' });
    }

    const dbInstance = db.getDb();
    
    // Get all data for the context
    const context = dbInstance.prepare('SELECT * FROM contexts WHERE id = ?').get(context_id);
    if (!context) {
      return res.status(404).json({ error: 'Context not found' });
    }

    const transactions = dbInstance.prepare(`
      SELECT * FROM transactions WHERE context_id = ? ORDER BY date DESC
    `).all(context_id);

    const subscriptions = dbInstance.prepare(`
      SELECT * FROM subscriptions WHERE context_id = ? ORDER BY service
    `).all(context_id);

    const savings = dbInstance.prepare(`
      SELECT * FROM savings WHERE context_id = ? ORDER BY account
    `).all(context_id);

    const budgets = dbInstance.prepare(`
      SELECT * FROM budgets WHERE context_id = ? ORDER BY month DESC, category
    `).all(context_id);

    const investments = dbInstance.prepare(`
      SELECT * FROM investments WHERE context_id = ? ORDER BY asset_name
    `).all(context_id);

    const exportData = {
      exportDate: new Date().toISOString(),
      context: context,
      data: {
        transactions,
        subscriptions,
        savings,
        budgets,
        investments
      },
      summary: {
        totalTransactions: transactions.length,
        totalSubscriptions: subscriptions.length,
        totalSavings: savings.length,
        totalBudgets: budgets.length,
        totalInvestments: investments.length
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

    const dbInstance = db.getDb();
    
    // Verify context exists
    const context = dbInstance.prepare('SELECT * FROM contexts WHERE id = ?').get(context_id);
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
      const insertTransaction = dbInstance.prepare(`
        INSERT INTO transactions (context_id, description, date, category, type, amount, account, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const transaction of data.transactions) {
        try {
          insertTransaction.run(
            context_id,
            transaction.description,
            transaction.date,
            transaction.category,
            transaction.type,
            transaction.amount,
            transaction.account,
            transaction.notes || ''
          );
          results.imported.transactions++;
        } catch (error) {
          results.errors.push(`Transaction import error: ${error.message}`);
        }
      }
    }

    // Import subscriptions
    if (data.subscriptions && Array.isArray(data.subscriptions)) {
      const insertSubscription = dbInstance.prepare(`
        INSERT INTO subscriptions (context_id, service, amount, frequency, next_billing_date, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      for (const subscription of data.subscriptions) {
        try {
          insertSubscription.run(
            context_id,
            subscription.service,
            subscription.amount,
            subscription.frequency,
            subscription.next_billing_date,
            subscription.status
          );
          results.imported.subscriptions++;
        } catch (error) {
          results.errors.push(`Subscription import error: ${error.message}`);
        }
      }
    }

    // Import savings
    if (data.savings && Array.isArray(data.savings)) {
      const insertSaving = dbInstance.prepare(`
        INSERT INTO savings (context_id, account, date, amount, goal, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      for (const saving of data.savings) {
        try {
          insertSaving.run(
            context_id,
            saving.account,
            saving.date,
            saving.amount,
            saving.goal,
            saving.description || ''
          );
          results.imported.savings++;
        } catch (error) {
          results.errors.push(`Savings import error: ${error.message}`);
        }
      }
    }

    // Import budgets
    if (data.budgets && Array.isArray(data.budgets)) {
      const insertBudget = dbInstance.prepare(`
        INSERT INTO budgets (context_id, category, monthly_limit, month, spent)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      for (const budget of data.budgets) {
        try {
          insertBudget.run(
            context_id,
            budget.category,
            budget.monthly_limit,
            budget.month,
            budget.spent || 0
          );
          results.imported.budgets++;
        } catch (error) {
          results.errors.push(`Budget import error: ${error.message}`);
        }
      }
    }

    // Import investments
    if (data.investments && Array.isArray(data.investments)) {
      const insertInvestment = dbInstance.prepare(`
        INSERT INTO investments (context_id, asset_name, type, amount_invested, current_value, date_invested, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const investment of data.investments) {
        try {
          insertInvestment.run(
            context_id,
            investment.asset_name,
            investment.type,
            investment.amount_invested,
            investment.current_value,
            investment.date_invested,
            investment.notes || ''
          );
          results.imported.investments++;
        } catch (error) {
          results.errors.push(`Investment import error: ${error.message}`);
        }
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

// GET /api/export/backup - Create a full database backup
router.get('/backup', async (req, res) => {
  try {
    const dbPath = path.join(__dirname, '../../finance.db');
    const backupPath = path.join(__dirname, '../../backups');
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `finance-backup-${timestamp}.db`;
    const fullBackupPath = path.join(backupPath, backupFileName);
    
    // Copy the database file
    fs.copyFileSync(dbPath, fullBackupPath);
    
    res.json({
      message: 'Backup created successfully',
      backupFile: backupFileName,
      backupPath: fullBackupPath,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

module.exports = router;
