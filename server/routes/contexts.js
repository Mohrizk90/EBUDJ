const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/contexts - Get all contexts
router.get('/', async (req, res) => {
  try {
    const { data: contexts, error } = await db.getSupabase()
      .from('contexts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      // Check for common errors
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return res.status(500).json({ 
          error: 'Database tables not found',
          message: 'Please run the SQL migration script (supabase-migration.sql) in your Supabase SQL Editor',
          details: error.message
        });
      }
      throw error;
    }
    
    console.log('Fetching contexts:', contexts);
    res.json(contexts || []);
  } catch (error) {
    console.error('Error fetching contexts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contexts',
      message: error.message || 'Unknown error occurred'
    });
  }
});

// POST /api/contexts - Create new context
router.post('/', async (req, res) => {
  try {
    const { name, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    if (!['Home', 'Work', 'Business'].includes(type)) {
      return res.status(400).json({ error: 'Type must be Home, Work, or Business' });
    }

    const { data: newContext, error } = await db.getSupabase()
      .from('contexts')
      .insert([{ name, type }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(newContext);
  } catch (error) {
    console.error('Error creating context:', error);
    res.status(500).json({ error: 'Failed to create context' });
  }
});

// PUT /api/contexts/:id - Update context
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    if (!['Home', 'Work', 'Business'].includes(type)) {
      return res.status(400).json({ error: 'Type must be Home, Work, or Business' });
    }

    const { data: updatedContext, error } = await db.getSupabase()
      .from('contexts')
      .update({ name, type })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!updatedContext) {
      return res.status(404).json({ error: 'Context not found' });
    }
    
    res.json(updatedContext);
  } catch (error) {
    console.error('Error updating context:', error);
    res.status(500).json({ error: 'Failed to update context' });
  }
});

// DELETE /api/contexts/:id - Delete context
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await db.getSupabase()
      .from('contexts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Context deleted successfully' });
  } catch (error) {
    console.error('Error deleting context:', error);
    res.status(500).json({ error: 'Failed to delete context' });
  }
});

module.exports = router;
