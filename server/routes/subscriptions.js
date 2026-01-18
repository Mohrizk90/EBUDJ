const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/subscriptions?context_id=:id - Get subscriptions for context
router.get('/', async (req, res) => {
  try {
    const { context_id } = req.query;
    
    if (!context_id) {
      return res.status(400).json({ error: 'context_id is required' });
    }

    const { data: subscriptions, error } = await db.getSupabase()
      .from('subscriptions')
      .select('*')
      .eq('context_id', context_id)
      .order('next_billing_date', { ascending: true });
    
    if (error) throw error;
    
    res.json(subscriptions || []);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// POST /api/subscriptions - Create new subscription
router.post('/', async (req, res) => {
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

    const { data: newSubscription, error } = await db.getSupabase()
      .from('subscriptions')
      .insert([{
        context_id,
        service,
        amount,
        frequency,
        next_billing_date,
        status
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(newSubscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// PUT /api/subscriptions/:id - Update subscription
router.put('/:id', async (req, res) => {
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

    const { data: updatedSubscription, error } = await db.getSupabase()
      .from('subscriptions')
      .update({
        service,
        amount,
        frequency,
        next_billing_date,
        status
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!updatedSubscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    res.json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// DELETE /api/subscriptions/:id - Delete subscription
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await db.getSupabase()
      .from('subscriptions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

module.exports = router;
