const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/budgets?context_id=:id&month=:month - Get budgets for context and month
router.get('/', async (req, res) => {
  try {
    const { context_id, month } = req.query;
    
    if (!context_id || !month) {
      return res.status(400).json({ error: 'context_id and month are required' });
    }

    const { data: budgets, error } = await db.getSupabase()
      .from('budgets')
      .select('*')
      .eq('context_id', context_id)
      .eq('month', month)
      .order('category', { ascending: true });
    
    if (error) throw error;
    
    console.log('Fetched budgets:', budgets);
    res.json(budgets || []);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// POST /api/budgets - Create new budget
router.post('/', async (req, res) => {
  try {
    const { context_id, category, monthly_limit, month } = req.body;
    
    if (!context_id || !category || !monthly_limit || !month) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (monthly_limit <= 0) {
      return res.status(400).json({ error: 'Monthly limit must be greater than 0' });
    }

    // Check if budget already exists for this category and month
    const { data: existingBudget } = await db.getSupabase()
      .from('budgets')
      .select('*')
      .eq('context_id', context_id)
      .eq('category', category)
      .eq('month', month)
      .single();

    if (existingBudget) {
      return res.status(400).json({ error: 'Budget already exists for this category and month' });
    }

    const { data: newBudget, error } = await db.getSupabase()
      .from('budgets')
      .insert([{
        context_id,
        category,
        monthly_limit,
        month,
        spent: 0
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Created budget with ID:', newBudget?.id);
    console.log('New budget data:', newBudget);
    res.status(201).json(newBudget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// PUT /api/budgets/:id - Update budget
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, monthly_limit, month } = req.body;
    
    if (!category || !monthly_limit || !month) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (monthly_limit <= 0) {
      return res.status(400).json({ error: 'Monthly limit must be greater than 0' });
    }

    const { data: updatedBudget, error } = await db.getSupabase()
      .from('budgets')
      .update({
        category,
        monthly_limit,
        month
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!updatedBudget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    res.json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// DELETE /api/budgets/:id - Delete budget
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await db.getSupabase()
      .from('budgets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

module.exports = router;
