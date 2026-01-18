const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/investments?context_id=:id - Get investments for context
router.get('/', async (req, res) => {
  try {
    const { context_id } = req.query;
    
    if (!context_id) {
      return res.status(400).json({ error: 'context_id is required' });
    }

    const { data: investments, error } = await db.getSupabase()
      .from('investments')
      .select('*')
      .eq('context_id', context_id)
      .order('date_invested', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(investments || []);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// POST /api/investments - Create new investment
router.post('/', async (req, res) => {
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

    const { data: newInvestment, error } = await db.getSupabase()
      .from('investments')
      .insert([{
        context_id,
        asset_name,
        type,
        amount_invested,
        current_value,
        date_invested,
        notes: notes || ''
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(newInvestment);
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ error: 'Failed to create investment' });
  }
});

// PUT /api/investments/:id - Update investment
router.put('/:id', async (req, res) => {
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

    const { data: updatedInvestment, error } = await db.getSupabase()
      .from('investments')
      .update({
        asset_name,
        type,
        amount_invested,
        current_value,
        date_invested,
        notes: notes || ''
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!updatedInvestment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    res.json(updatedInvestment);
  } catch (error) {
    console.error('Error updating investment:', error);
    res.status(500).json({ error: 'Failed to update investment' });
  }
});

// DELETE /api/investments/:id - Delete investment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await db.getSupabase()
      .from('investments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    console.error('Error deleting investment:', error);
    res.status(500).json({ error: 'Failed to delete investment' });
  }
});

module.exports = router;
