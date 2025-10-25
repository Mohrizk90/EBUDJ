const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../config/database');

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// GET /api/transactions?context_id=:id - Get transactions for context
router.get('/', [
  query('context_id').isInt({ min: 1 }).withMessage('context_id must be a positive integer')
], validateRequest, (req, res) => {
  try {
    const { context_id } = req.query;
    
    if (!context_id) {
      return res.status(400).json({ error: 'context_id is required' });
    }

    const transactions = db.getDb().prepare(`
      SELECT * FROM transactions 
      WHERE context_id = ? 
      ORDER BY date DESC, created_at DESC
    `).all(context_id);
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/transactions - Create new transaction
router.post('/', [
  body('context_id').isInt({ min: 1 }).withMessage('context_id must be a positive integer'),
  body('description').trim().isLength({ min: 1, max: 255 }).withMessage('description must be between 1 and 255 characters'),
  body('date').isISO8601().withMessage('date must be a valid ISO 8601 date'),
  body('category').trim().isLength({ min: 1, max: 100 }).withMessage('category must be between 1 and 100 characters'),
  body('type').isIn(['Income', 'Expense']).withMessage('type must be either Income or Expense'),
  body('amount').isFloat({ min: 0.01 }).withMessage('amount must be a positive number'),
  body('account').trim().isLength({ min: 1, max: 100 }).withMessage('account must be between 1 and 100 characters'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('notes must be less than 500 characters')
], validateRequest, (req, res) => {
  try {
    const { context_id, description, date, category, type, amount, account, notes } = req.body;
    
    console.log('Received transaction data:', req.body);
    console.log('Type received:', type, 'Type check:', typeof type);
    
    // Check if context exists
    const contextExists = db.getDb().prepare('SELECT id FROM contexts WHERE id = ?').get(context_id);
    if (!contextExists) {
      const availableContexts = db.getDb().prepare('SELECT * FROM contexts').all();
      console.log('Available contexts:', availableContexts);
      return res.status(400).json({ 
        error: `Context with ID ${context_id} does not exist. Available contexts: ${JSON.stringify(availableContexts)}` 
      });
    }
    
    // Always log available contexts for debugging
    const availableContexts = db.getDb().prepare('SELECT * FROM contexts').all();
    console.log('Available contexts in database:', availableContexts);
    
    if (!context_id || !description || !date || !category || !type || !amount || !account) {
      return res.status(400).json({ error: 'All fields except notes are required' });
    }
    
    if (!['Income', 'Expense'].includes(type)) {
      console.log('Type validation failed. Received:', type, 'Expected: Income or Expense');
      return res.status(400).json({ error: 'Type must be Income or Expense' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Handle budget integration for expenses
    let budgetWarning = null;
    if (type === 'Expense') {
      const currentDate = new Date(date);
      const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Check if there's a budget for this category and month
      console.log('Looking for budget:', { context_id, category, currentMonth });
      const budget = db.getDb().prepare(`
        SELECT * FROM budgets 
        WHERE context_id = ? AND category = ? AND month = ?
      `).get(context_id, category, currentMonth);
      
      console.log('Found budget:', budget);
      
      if (budget) {
        const currentSpent = budget.spent || 0;
        const newSpent = currentSpent + amount;
        const budgetLimit = budget.monthly_limit;
        
        // Update the spent amount in the budget
        console.log('Updating budget:', { budgetId: budget.id, currentSpent, newSpent, amount });
        const updateBudgetStmt = db.getDb().prepare(`
          UPDATE budgets SET spent = ? WHERE id = ?
        `);
        const updateResult = updateBudgetStmt.run(newSpent, budget.id);
        console.log('Budget update result:', updateResult);
        
        // Check if over budget and create warning
        if (newSpent > budgetLimit) {
          const overage = newSpent - budgetLimit;
          budgetWarning = {
            message: `Budget exceeded for ${category}!`,
            details: `Spent $${newSpent.toFixed(2)} of $${budgetLimit.toFixed(2)} budget ($${overage.toFixed(2)} over)`,
            category: category,
            spent: newSpent,
            limit: budgetLimit,
            overage: overage
          };
        }
        
        console.log('Budget updated:', { category, spent: newSpent, limit: budgetLimit, overage: newSpent - budgetLimit });
      }
    }

    const stmt = db.getDb().prepare(`
      INSERT INTO transactions (context_id, description, date, category, type, amount, account, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    console.log('Inserting transaction with values:', [context_id, description, date, category, type, amount, account, notes || '']);
    const result = stmt.run(context_id, description, date, category, type, amount, account, notes || '');
    
    const newTransaction = db.getDb().prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
    console.log('Created transaction:', newTransaction);
    
    // Include budget warning in response if applicable
    const response = { ...newTransaction };
    if (budgetWarning) {
      response.budgetWarning = budgetWarning;
    }
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// PUT /api/transactions/:id - Update transaction
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { description, date, category, type, amount, account, notes } = req.body;
    
    if (!description || !date || !category || !type || !amount || !account) {
      return res.status(400).json({ error: 'All fields except notes are required' });
    }
    
    if (!['Income', 'Expense'].includes(type)) {
      return res.status(400).json({ error: 'Type must be Income or Expense' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const stmt = db.getDb().prepare(`
      UPDATE transactions 
      SET description = ?, date = ?, category = ?, type = ?, amount = ?, account = ?, notes = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(description, date, category, type, amount, account, notes || '', id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const updatedTransaction = db.getDb().prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.getDb().prepare('DELETE FROM transactions WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;
