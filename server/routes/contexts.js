const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/contexts - Get all contexts
router.get('/', (req, res) => {
  try {
    const contexts = db.getDb().prepare('SELECT * FROM contexts ORDER BY created_at DESC').all();
    console.log('Fetching contexts:', contexts);
    res.json(contexts);
  } catch (error) {
    console.error('Error fetching contexts:', error);
    res.status(500).json({ error: 'Failed to fetch contexts' });
  }
});

// POST /api/contexts - Create new context
router.post('/', (req, res) => {
  try {
    const { name, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    if (!['Home', 'Work', 'Business'].includes(type)) {
      return res.status(400).json({ error: 'Type must be Home, Work, or Business' });
    }

    const stmt = db.getDb().prepare('INSERT INTO contexts (name, type) VALUES (?, ?)');
    const result = stmt.run(name, type);
    
    const newContext = db.getDb().prepare('SELECT * FROM contexts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newContext);
  } catch (error) {
    console.error('Error creating context:', error);
    res.status(500).json({ error: 'Failed to create context' });
  }
});

// PUT /api/contexts/:id - Update context
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    if (!['Home', 'Work', 'Business'].includes(type)) {
      return res.status(400).json({ error: 'Type must be Home, Work, or Business' });
    }

    const stmt = db.getDb().prepare('UPDATE contexts SET name = ?, type = ? WHERE id = ?');
    const result = stmt.run(name, type, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Context not found' });
    }
    
    const updatedContext = db.getDb().prepare('SELECT * FROM contexts WHERE id = ?').get(id);
    res.json(updatedContext);
  } catch (error) {
    console.error('Error updating context:', error);
    res.status(500).json({ error: 'Failed to update context' });
  }
});

// DELETE /api/contexts/:id - Delete context
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.getDb().prepare('DELETE FROM contexts WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Context not found' });
    }
    
    res.json({ message: 'Context deleted successfully' });
  } catch (error) {
    console.error('Error deleting context:', error);
    res.status(500).json({ error: 'Failed to delete context' });
  }
});

module.exports = router;
