const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/investments?context_id=:id - Get investments for context
router.get('/', (req, res) => {
  try {
    const { context_id } = req.query;
    
    if (!context_id) {
      return res.status(400).json({ error: 'context_id is required' });
    }

    const investments = db.getDb().prepare(`
      SELECT * FROM investments 
      WHERE context_id = ? 
      ORDER BY date_invested DESC, created_at DESC
    `).all(context_id);
    
    res.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// POST /api/investments - Create new investment
router.post('/', (req, res) => {
  try {
    const { context_id, asset_name, type, amount_invested, current_value, date_invested, notes } = req.body;
    
    if (!context_id || !asset_name || !type || !amount_invested || !current_value || !date_invested) {
      return res.status(400).json({ error: 'All fields except notes are required' });
    }
    
    if (!['Stock', 'Bond', 'Mutual Fund', 'ETF', 'Crypto', 'Real Estate', 'Commodity', 'REIT', 'Options', 'Futures', 'Forex', 'Other'].includes(type)) {
      return res.status(400).json({ error: 'Type must be Stock, Bond, Mutual Fund, ETF, Crypto, Real Estate, Commodity, REIT, Options, Futures, Forex, or Other' });
    }

    if (amount_invested <= 0) {
      return res.status(400).json({ error: 'Amount invested must be greater than 0' });
    }

    if (current_value < 0) {
      return res.status(400).json({ error: 'Current value cannot be negative' });
    }

    const stmt = db.getDb().prepare(`
      INSERT INTO investments (context_id, asset_name, type, amount_invested, current_value, date_invested, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(context_id, asset_name, type, amount_invested, current_value, date_invested, notes || '');
    
    const newInvestment = db.getDb().prepare('SELECT * FROM investments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newInvestment);
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ error: 'Failed to create investment' });
  }
});

// PUT /api/investments/:id - Update investment
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { asset_name, type, amount_invested, current_value, date_invested, notes } = req.body;
    
    if (!asset_name || !type || !amount_invested || !current_value || !date_invested) {
      return res.status(400).json({ error: 'All fields except notes are required' });
    }
    
    if (!['Stock', 'Bond', 'Mutual Fund', 'ETF', 'Crypto', 'Real Estate', 'Commodity', 'REIT', 'Options', 'Futures', 'Forex', 'Other'].includes(type)) {
      return res.status(400).json({ error: 'Type must be Stock, Bond, Mutual Fund, ETF, Crypto, Real Estate, Commodity, REIT, Options, Futures, Forex, or Other' });
    }

    if (amount_invested <= 0) {
      return res.status(400).json({ error: 'Amount invested must be greater than 0' });
    }

    if (current_value < 0) {
      return res.status(400).json({ error: 'Current value cannot be negative' });
    }

    const stmt = db.getDb().prepare(`
      UPDATE investments 
      SET asset_name = ?, type = ?, amount_invested = ?, current_value = ?, date_invested = ?, notes = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(asset_name, type, amount_invested, current_value, date_invested, notes || '', id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    const updatedInvestment = db.getDb().prepare('SELECT * FROM investments WHERE id = ?').get(id);
    res.json(updatedInvestment);
  } catch (error) {
    console.error('Error updating investment:', error);
    res.status(500).json({ error: 'Failed to update investment' });
  }
});

// DELETE /api/investments/:id - Delete investment
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.getDb().prepare('DELETE FROM investments WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    console.error('Error deleting investment:', error);
    res.status(500).json({ error: 'Failed to delete investment' });
  }
});

module.exports = router;
