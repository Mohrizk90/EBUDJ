const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/savings?context_id=:id - Get savings for context
router.get('/', async (req, res) => {
  try {
    const { context_id } = req.query;
    
    if (!context_id) {
      return res.status(400).json({ error: 'context_id is required' });
    }

    const { data: savings, error } = await db.getSupabase()
      .from('savings')
      .select('*')
      .eq('context_id', context_id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(savings || []);
  } catch (error) {
    console.error('Error fetching savings:', error);
    res.status(500).json({ error: 'Failed to fetch savings' });
  }
});

// POST /api/savings - Create new savings record
router.post('/', async (req, res) => {
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

    const { data: newSaving, error } = await db.getSupabase()
      .from('savings')
      .insert([{
        context_id,
        account,
        date: date || null,
        amount,
        goal,
        description: description || null
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(newSaving);
  } catch (error) {
    console.error('Error creating savings record:', error);
    res.status(500).json({ error: 'Failed to create savings record' });
  }
});

// PUT /api/savings/:id - Update savings record
router.put('/:id', async (req, res) => {
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

    const { data: updatedSaving, error } = await db.getSupabase()
      .from('savings')
      .update({
        account,
        date: date || null,
        amount,
        goal,
        description: description || null
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!updatedSaving) {
      return res.status(404).json({ error: 'Savings record not found' });
    }
    
    res.json(updatedSaving);
  } catch (error) {
    console.error('Error updating savings record:', error);
    res.status(500).json({ error: 'Failed to update savings record' });
  }
});

// DELETE /api/savings/:id - Delete savings record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await db.getSupabase()
      .from('savings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Savings record deleted successfully' });
  } catch (error) {
    console.error('Error deleting savings record:', error);
    res.status(500).json({ error: 'Failed to delete savings record' });
  }
});

module.exports = router;
