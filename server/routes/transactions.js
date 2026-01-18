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
], validateRequest, async (req, res) => {
  try {
    const { context_id } = req.query;
    
    if (!context_id) {
      return res.status(400).json({ error: 'context_id is required' });
    }

    const { data: transactions, error } = await db.getSupabase()
      .from('transactions')
      .select('*')
      .eq('context_id', context_id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(transactions || []);
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
], validateRequest, async (req, res) => {
  try {
    const { context_id, description, date, category, type, amount, account, notes } = req.body;
    
    console.log('Received transaction data:', req.body);
    console.log('Type received:', type, 'Type check:', typeof type);
    
    // Check if context exists
    const { data: contextExists } = await db.getSupabase()
      .from('contexts')
      .select('id')
      .eq('id', context_id)
      .single();
    
    if (!contextExists) {
      const { data: availableContexts } = await db.getSupabase()
        .from('contexts')
        .select('*');
      console.log('Available contexts:', availableContexts);
      return res.status(400).json({ 
        error: `Context with ID ${context_id} does not exist. Available contexts: ${JSON.stringify(availableContexts)}` 
      });
    }
    
    // Always log available contexts for debugging
    const { data: availableContexts } = await db.getSupabase()
      .from('contexts')
      .select('*');
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
      const { data: budget } = await db.getSupabase()
        .from('budgets')
        .select('*')
        .eq('context_id', context_id)
        .eq('category', category)
        .eq('month', currentMonth)
        .single();
      
      console.log('Found budget:', budget);
      
      if (budget) {
        const currentSpent = budget.spent || 0;
        const newSpent = currentSpent + amount;
        const budgetLimit = budget.monthly_limit;
        
        // Update the spent amount in the budget
        console.log('Updating budget:', { budgetId: budget.id, currentSpent, newSpent, amount });
        const { error: updateError } = await db.getSupabase()
          .from('budgets')
          .update({ spent: newSpent })
          .eq('id', budget.id);
        
        if (updateError) {
          console.error('Budget update error:', updateError);
        } else {
          console.log('Budget updated successfully');
        }
        
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

    const { data: newTransaction, error } = await db.getSupabase()
      .from('transactions')
      .insert([{
        context_id,
        description,
        date,
        category,
        type,
        amount,
        account,
        notes: notes || ''
      }])
      .select()
      .single();
    
    if (error) throw error;
    
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
router.put('/:id', async (req, res) => {
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

    const { data: updatedTransaction, error } = await db.getSupabase()
      .from('transactions')
      .update({
        description,
        date,
        category,
        type,
        amount,
        account,
        notes: notes || ''
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!updatedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await db.getSupabase()
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;
