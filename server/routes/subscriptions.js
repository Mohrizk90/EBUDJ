const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/subscriptions?context_id=:id - Get subscriptions for context
router.get('/', (req, res) => {
  try {
    const { context_id } = req.query;
    
    if (!context_id) {
      return res.status(400).json({ error: 'context_id is required' });
    }

    const subscriptions = db.getDb().prepare(`
      SELECT * FROM subscriptions 
      WHERE context_id = ? 
      ORDER BY next_billing_date ASC
    `).all(context_id);
    
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// POST /api/subscriptions - Create new subscription
router.post('/', (req, res) => {
  try {
    const { context_id, service, amount, frequency, next_billing_date, status } = req.body;
    
    console.log('Received subscription data:', req.body);
    console.log('Frequency received:', frequency, 'Type:', typeof frequency);
    
    if (!context_id || !service || !amount || !frequency || !next_billing_date || !status) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (!['monthly', 'yearly', 'weekly', 'daily'].includes(frequency)) {
      console.log('Frequency validation failed. Received:', frequency, 'Expected: monthly, yearly, weekly, or daily');
      return res.status(400).json({ error: 'Frequency must be monthly, yearly, weekly, or daily' });
    }
    
    if (!['Active', 'Paused', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Active, Paused, or Cancelled' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const stmt = db.getDb().prepare(`
      INSERT INTO subscriptions (context_id, service, amount, frequency, next_billing_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(context_id, service, amount, frequency, next_billing_date, status);
    
    const newSubscription = db.getDb().prepare('SELECT * FROM subscriptions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newSubscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// PUT /api/subscriptions/:id - Update subscription
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { service, amount, frequency, next_billing_date, status } = req.body;
    
    if (!service || !amount || !frequency || !next_billing_date || !status) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (!['monthly', 'yearly', 'weekly', 'daily'].includes(frequency)) {
      return res.status(400).json({ error: 'Frequency must be monthly, yearly, weekly, or daily' });
    }
    
    if (!['Active', 'Paused', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Active, Paused, or Cancelled' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const stmt = db.getDb().prepare(`
      UPDATE subscriptions 
      SET service = ?, amount = ?, frequency = ?, next_billing_date = ?, status = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(service, amount, frequency, next_billing_date, status, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    const updatedSubscription = db.getDb().prepare('SELECT * FROM subscriptions WHERE id = ?').get(id);
    res.json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// DELETE /api/subscriptions/:id - Delete subscription
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.getDb().prepare('DELETE FROM subscriptions WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

module.exports = router;
