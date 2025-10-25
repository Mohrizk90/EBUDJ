const request = require('supertest');
const express = require('express');
const transactionsRouter = require('../routes/transactions');
const db = require('../config/database');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/transactions', transactionsRouter);

describe('Transactions API', () => {
  beforeEach(() => {
    // Clean up test data
    const dbInstance = db.getDb();
    dbInstance.prepare('DELETE FROM transactions WHERE description LIKE "Test%"').run();
  });

  afterAll(() => {
    // Clean up after all tests
    const dbInstance = db.getDb();
    dbInstance.prepare('DELETE FROM transactions WHERE description LIKE "Test%"').run();
  });

  describe('GET /api/transactions', () => {
    it('should return transactions for a valid context_id', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .query({ context_id: 1 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 400 for missing context_id', async () => {
      const response = await request(app)
        .get('/api/transactions');

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid context_id', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .query({ context_id: 'invalid' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/transactions', () => {
    const validTransaction = {
      context_id: 1,
      description: 'Test Transaction',
      date: '2024-01-15',
      category: 'Test Category',
      type: 'Expense',
      amount: 100.50,
      account: 'Test Account',
      notes: 'Test notes'
    };

    it('should create a transaction with valid data', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send(validTransaction);

      expect(response.status).toBe(201);
      expect(response.body.description).toBe(validTransaction.description);
      expect(response.body.amount).toBe(validTransaction.amount);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidTransaction = { ...validTransaction };
      delete invalidTransaction.description;

      const response = await request(app)
        .post('/api/transactions')
        .send(invalidTransaction);

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid transaction type', async () => {
      const invalidTransaction = { ...validTransaction, type: 'Invalid' };

      const response = await request(app)
        .post('/api/transactions')
        .send(invalidTransaction);

      expect(response.status).toBe(400);
    });

    it('should return 400 for negative amount', async () => {
      const invalidTransaction = { ...validTransaction, amount: -10 };

      const response = await request(app)
        .post('/api/transactions')
        .send(invalidTransaction);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('should update an existing transaction', async () => {
      // First create a transaction
      const createResponse = await request(app)
        .post('/api/transactions')
        .send({
          context_id: 1,
          description: 'Test Transaction',
          date: '2024-01-15',
          category: 'Test Category',
          type: 'Expense',
          amount: 100.50,
          account: 'Test Account'
        });

      const transactionId = createResponse.body.id;

      // Then update it
      const updateResponse = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .send({
          description: 'Updated Test Transaction',
          date: '2024-01-15',
          category: 'Test Category',
          type: 'Expense',
          amount: 150.75,
          account: 'Test Account'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.description).toBe('Updated Test Transaction');
      expect(updateResponse.body.amount).toBe(150.75);
    });

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(app)
        .put('/api/transactions/99999')
        .send({
          description: 'Test',
          date: '2024-01-15',
          category: 'Test',
          type: 'Expense',
          amount: 100,
          account: 'Test'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('should delete an existing transaction', async () => {
      // First create a transaction
      const createResponse = await request(app)
        .post('/api/transactions')
        .send({
          context_id: 1,
          description: 'Test Transaction',
          date: '2024-01-15',
          category: 'Test Category',
          type: 'Expense',
          amount: 100.50,
          account: 'Test Account'
        });

      const transactionId = createResponse.body.id;

      // Then delete it
      const deleteResponse = await request(app)
        .delete(`/api/transactions/${transactionId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toBe('Transaction deleted successfully');
    });

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(app)
        .delete('/api/transactions/99999');

      expect(response.status).toBe(404);
    });
  });
});
