import React, { useState, useEffect } from 'react';
import { useFinanceContext } from '../contexts/ContextContext';
import { createTransaction, updateTransaction, getBudgets } from '../services/api';
import { useNotification } from './NotificationSystem';

const TransactionModal = ({ transaction, onClose, onSave }) => {
  const { success, error: showError } = useNotification();
  const { currentContext } = useFinanceContext();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'Expense',
    category: '',
    account: '',
    date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [budgetStatus, setBudgetStatus] = useState(null);

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description || '',
        amount: transaction.amount || '',
        type: transaction.type || 'Expense',
        category: transaction.category || '',
        account: transaction.account || '',
        date: transaction.date ? transaction.date.split('T')[0] : '',
        notes: transaction.notes || ''
      });
    }
  }, [transaction]);

  // Check budget status when category or amount changes for expenses
  useEffect(() => {
    const checkBudgetStatus = async () => {
      if (formData.type === 'Expense' && formData.category && formData.amount && currentContext?.id) {
        try {
          const currentDate = new Date();
          const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
          const budgets = await getBudgets(currentContext.id, currentMonth);
          const budget = budgets.find(b => b.category === formData.category);
          
          if (budget) {
            const currentSpent = budget.spent || 0;
            const newSpent = currentSpent + parseFloat(formData.amount);
            const budgetLimit = budget.monthly_limit;
            const remaining = budgetLimit - currentSpent;
            
            setBudgetStatus({
              budget,
              currentSpent,
              newSpent,
              budgetLimit,
              remaining,
              willExceed: newSpent > budgetLimit,
              overage: newSpent > budgetLimit ? newSpent - budgetLimit : 0
            });
          } else {
            setBudgetStatus(null);
          }
        } catch (error) {
          console.error('Error checking budget status:', error);
          setBudgetStatus(null);
        }
      } else {
        setBudgetStatus(null);
      }
    };

    checkBudgetStatus();
  }, [formData.category, formData.amount, formData.type, currentContext?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!currentContext) {
        throw new Error('No context selected. Please select a context first.');
      }

      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        context_id: currentContext.id
      };

      console.log('Current context:', currentContext);
      console.log('Form data before submission:', JSON.stringify(formData, null, 2));
      console.log('Transaction data being sent:', JSON.stringify(transactionData, null, 2));

      let savedTransaction;
      if (transaction) {
        savedTransaction = await updateTransaction(transaction.id, transactionData);
      } else {
        savedTransaction = await createTransaction(transactionData);
      }

      console.log('Saved transaction response:', savedTransaction);

      // Handle budget warnings
      if (savedTransaction.budgetWarning) {
        const warning = savedTransaction.budgetWarning;
        setError(`⚠️ ${warning.message}\n${warning.details}`);
        // Don't close modal if there's a budget warning, let user see it
        setTimeout(() => {
          setError('');
          onSave(savedTransaction);
          success(transaction ? 'Transaction updated successfully!' : 'Transaction created successfully!');
          // Trigger global refresh for budgets
          window.dispatchEvent(new CustomEvent('transactionCreated', { detail: savedTransaction }));
          onClose();
        }, 3000);
      } else {
        onSave(savedTransaction);
        success(transaction ? 'Transaction updated successfully!' : 'Transaction created successfully!');
        // Trigger global refresh for budgets
        window.dispatchEvent(new CustomEvent('transactionCreated', { detail: savedTransaction }));
        onClose();
      }
    } catch (err) {
      setError('Failed to save transaction');
      showError('Failed to save transaction. Please try again.');
      console.error('Transaction save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('Form data updated:', newData);
      return newData;
    });
  };

  const categories = {
    Income: [
      'Salary',
      'Freelance',
      'Investment',
      'Business',
      'Gift',
      'Refund',
      'Other'
    ],
    Expense: [
      'Food & Dining',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Bills & Utilities',
      'Healthcare',
      'Education',
      'Travel',
      'Groceries',
      'Other'
    ]
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-gray-100" onClick={(e) => e.stopPropagation()}>
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 border-b border-gray-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  {transaction ? '✏️' : '💰'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {transaction ? 'Edit Transaction' : 'Add New Transaction'}
                  </h2>
                  <p className="text-gray-600">
                    {transaction ? 'Update your transaction details' : 'Track your income or expense'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <form id="transaction-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 text-red-500">⚠️</div>
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Enhanced Transaction Type */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <span>Transaction Type</span>
                <span className="text-red-500">*</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Current: {formData.type}</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Income button clicked, current type:', formData.type);
                    setFormData(prev => {
                      const newData = { ...prev, type: 'Income', category: '' };
                      console.log('Setting form data to:', newData);
                      return newData;
                    });
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    formData.type === 'Income'
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 shadow-lg shadow-green-100'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50/30 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all duration-200 ${
                      formData.type === 'Income' 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg' 
                        : 'bg-gray-400'
                    }`}>
                      📈
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Income</p>
                      <p className="text-xs text-gray-500">Money coming in</p>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log('Expense button clicked, current type:', formData.type);
                    setFormData(prev => {
                      const newData = { ...prev, type: 'Expense', category: '' };
                      console.log('Setting form data to:', newData);
                      return newData;
                    });
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    formData.type === 'Expense'
                      ? 'border-red-500 bg-gradient-to-br from-red-50 to-rose-50 text-red-700 shadow-lg shadow-red-100'
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-50/30 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all duration-200 ${
                      formData.type === 'Expense' 
                        ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-lg' 
                        : 'bg-gray-400'
                    }`}>
                      📉
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Expense</p>
                      <p className="text-xs text-gray-500">Money going out</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Enhanced Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <span>Description</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                  placeholder="e.g., Grocery shopping, Salary payment"
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <span>Amount</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                {/* Budget Status Display */}
                {budgetStatus && (
                  <div className={`mt-3 p-3 rounded-lg border ${
                    budgetStatus.willExceed 
                      ? 'bg-red-50 border-red-200' 
                      : budgetStatus.remaining < parseFloat(formData.amount) * 2
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg ${
                        budgetStatus.willExceed ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {budgetStatus.willExceed ? '⚠️' : '💰'}
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          budgetStatus.willExceed ? 'text-red-800' : 'text-green-800'
                        }`}>
                          {budgetStatus.willExceed 
                            ? `Budget will be exceeded by $${budgetStatus.overage.toFixed(2)}`
                            : `Budget: $${budgetStatus.remaining.toFixed(2)} remaining`
                          }
                        </p>
                        <p className="text-xs text-gray-600">
                          Spent: ${budgetStatus.currentSpent.toFixed(2)} / ${budgetStatus.budgetLimit.toFixed(2)}
                        </p>
                        {budgetStatus.willExceed && (
                          <p className="text-xs text-red-600 mt-1">
                            💡 This expense will deduct from your balance beyond the budget
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <span>Category</span>
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                  required
                >
                  <option value="">Select a category</option>
                  {categories[formData.type]?.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Account */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <span>Account</span>
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="account"
                  value={formData.account}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                  required
                >
                  <option value="">Select an account</option>
                  <option value="Checking">Checking</option>
                  <option value="Savings">Savings</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Investment">Investment</option>
                </select>
              </div>
            </div>

            {/* Date and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <span>Date</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                  required
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 resize-none"
                  rows={3}
                  placeholder="Additional details about this transaction"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Enhanced Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 rounded-b-2xl">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="transaction-form"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>{transaction ? 'Update Transaction' : 'Add Transaction'}</span>
                  <span>{transaction ? '✏️' : '➕'}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;