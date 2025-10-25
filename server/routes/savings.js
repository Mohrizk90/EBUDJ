const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/savings?context_id=:id - Get savings for context
router.get('/', (req, res) => {
  try {
    const { context_id } = req.query;
    
    if (!context_id) {
      return res.status(400).json({ error: 'context_id is required' });
    }

    const savings = db.getDb().prepare(`
      SELECT * FROM savings 
      WHERE context_id = ? 
      ORDER BY date DESC, created_at DESC
    `).all(context_id);
    
    res.json(savings);
  } catch (error) {
    console.error('Error fetching savings:', error);
    res.status(500).json({ error: 'Failed to fetch savings' });
  }
});

// POST /api/savings - Create new savings record
router.post('/', (req, res) => {
  try {
    const { context_id, account, date, amount, goal, description } = req.body;
    
    console.log('Received savings data:', req.body);
    
    if (!context_id || !account || amount === undefined || amount === null || isNaN(amount) || !goal || isNaN(goal)) {
      return res.status(400).json({ error: 'context_id, account, amount, and goal are required' });
    }

    if (amount < 0) {
      return res.status(400).json({ error: 'Amount cannot be negative' });
    }

    if (goal <= 0) {
      return res.status(400).json({ error: 'Goal must be greater than 0' });
    }

    const stmt = db.getDb().prepare(`
      INSERT INTO savings (context_id, account, date, amount, goal, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(context_id, account, date || null, amount, goal, description || null);
    
    const newSaving = db.getDb().prepare('SELECT * FROM savings WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newSaving);
  } catch (error) {
    console.error('Error creating savings record:', error);
    res.status(500).json({ error: 'Failed to create savings record' });
  }
});

// PUT /api/savings/:id - Update savings record
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { account, date, amount, goal, description } = req.body;
    
    console.log('Received savings update data:', req.body);
    console.log('Amount value:', amount, 'Type:', typeof amount);
    console.log('Account value:', account, 'Type:', typeof account);
    console.log('Goal value:', goal, 'Type:', typeof goal);
    
    if (!account || amount === undefined || amount === null || isNaN(amount) || !goal || isNaN(goal)) {
      console.log('Validation failed:');
      console.log('- account:', account, '(!account):', !account);
      console.log('- amount:', amount, '(undefined):', amount === undefined, '(null):', amount === null, '(isNaN):', isNaN(amount));
      console.log('- goal:', goal, '(!goal):', !goal, '(isNaN):', isNaN(goal));
      return res.status(400).json({ error: 'account, amount, and goal are required' });
    }

    if (amount < 0) {
      return res.status(400).json({ error: 'Amount cannot be negative' });
    }

    if (goal <= 0) {
      return res.status(400).json({ error: 'Goal must be greater than 0' });
    }

    const stmt = db.getDb().prepare(`
      UPDATE savings 
      SET account = ?, date = ?, amount = ?, goal = ?, description = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(account, date || null, amount, goal, description || null, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Savings record not found' });
    }
    
    const updatedSaving = db.getDb().prepare('SELECT * FROM savings WHERE id = ?').get(id);
    res.json(updatedSaving);
  } catch (error) {
    console.error('Error updating savings record:', error);
    res.status(500).json({ error: 'Failed to update savings record' });
  }
});

// DELETE /api/savings/:id - Delete savings record
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.getDb().prepare('DELETE FROM savings WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Savings record not found' });
    }
    
    res.json({ message: 'Savings record deleted successfully' });
  } catch (error) {
    console.error('Error deleting savings record:', error);
    res.status(500).json({ error: 'Failed to delete savings record' });
  }
});

module.exports = router;
