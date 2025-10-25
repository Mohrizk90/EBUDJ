const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/budgets?context_id=:id&month=:month - Get budgets for context and month
router.get('/', (req, res) => {
  try {
    const { context_id, month } = req.query;
    
    if (!context_id || !month) {
      return res.status(400).json({ error: 'context_id and month are required' });
    }

    const budgets = db.getDb().prepare(`
      SELECT * FROM budgets 
      WHERE context_id = ? AND month = ?
      ORDER BY category ASC
    `).all(context_id, month);
    
    console.log('Fetched budgets:', budgets);
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// POST /api/budgets - Create new budget
router.post('/', (req, res) => {
  try {
    const { context_id, category, monthly_limit, month } = req.body;
    
    if (!context_id || !category || !monthly_limit || !month) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (monthly_limit <= 0) {
      return res.status(400).json({ error: 'Monthly limit must be greater than 0' });
    }

    // Check if budget already exists for this category and month
    const existingBudget = db.getDb().prepare(`
      SELECT * FROM budgets 
      WHERE context_id = ? AND category = ? AND month = ?
    `).get(context_id, category, month);

    if (existingBudget) {
      return res.status(400).json({ error: 'Budget already exists for this category and month' });
    }

    const stmt = db.getDb().prepare(`
      INSERT INTO budgets (context_id, category, monthly_limit, month, spent)
      VALUES (?, ?, ?, ?, 0)
    `);
    
    const result = stmt.run(context_id, category, monthly_limit, month);
    console.log('Created budget with ID:', result.lastInsertRowid);
    
    const newBudget = db.getDb().prepare('SELECT * FROM budgets WHERE id = ?').get(result.lastInsertRowid);
    console.log('New budget data:', newBudget);
    res.status(201).json(newBudget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// PUT /api/budgets/:id - Update budget
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { category, monthly_limit, month } = req.body;
    
    if (!category || !monthly_limit || !month) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (monthly_limit <= 0) {
      return res.status(400).json({ error: 'Monthly limit must be greater than 0' });
    }

    const stmt = db.getDb().prepare(`
      UPDATE budgets 
      SET category = ?, monthly_limit = ?, month = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(category, monthly_limit, month, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    const updatedBudget = db.getDb().prepare('SELECT * FROM budgets WHERE id = ?').get(id);
    res.json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// DELETE /api/budgets/:id - Delete budget
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.getDb().prepare('DELETE FROM budgets WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

module.exports = router;
