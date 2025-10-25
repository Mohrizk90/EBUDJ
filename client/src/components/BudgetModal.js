import React, { useState, useEffect } from 'react';
import { useFinanceContext } from '../contexts/ContextContext';
import { createBudget, updateBudget, createTransaction } from '../services/api';

const BudgetModal = ({ budget, onClose, onSave }) => {
  const { currentContext } = useFinanceContext();
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category || '',
        amount: budget.amount || '',
        period: budget.period || 'monthly',
        description: budget.description || ''
      });
    }
  }, [budget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!currentContext) {
        throw new Error('No context selected. Please select a context first.');
      }

      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      const budgetData = {
        context_id: currentContext.id,
        category: formData.category,
        monthly_limit: parseFloat(formData.amount),
        month: currentMonth,
        description: formData.description
      };

      console.log('Budget data being sent:', budgetData);

      let savedBudget;
      if (budget) {
        // For existing budgets, create transaction if amount changed
        const oldAmount = budget.monthly_limit || 0;
        const newAmount = parseFloat(formData.amount);
        const amountDifference = newAmount - oldAmount;
        
        savedBudget = await updateBudget(budget.id, budgetData);
        
        // Create transaction if budget amount changed
        if (amountDifference !== 0) {
          const transactionData = {
            context_id: currentContext.id,
            description: `Budget adjustment for ${formData.category}`,
            date: new Date().toISOString(),
            category: 'Budget',
            type: amountDifference > 0 ? 'Expense' : 'Income',
            amount: Math.abs(amountDifference),
            account: formData.category,
            notes: `Automatic transaction from budget adjustment. ${amountDifference > 0 ? 'Budget increased' : 'Budget decreased'}.`
          };
          
          console.log('Creating automatic budget transaction:', transactionData);
          await createTransaction(transactionData);
        }
      } else {
        // For new budgets, create initial transaction
        savedBudget = await createBudget(budgetData);
        
        const initialAmount = parseFloat(formData.amount);
        if (initialAmount > 0) {
          const transactionData = {
            context_id: currentContext.id,
            description: `Initial budget allocation for ${formData.category}`,
            date: new Date().toISOString(),
            category: 'Budget',
            type: 'Expense',
            amount: initialAmount,
            account: formData.category,
            notes: `Initial budget allocation: ${formData.category}`
          };
          
          console.log('Creating initial budget transaction:', transactionData);
          await createTransaction(transactionData);
        }
      }

      onSave(savedBudget);
    } catch (err) {
      setError(err.message || 'Failed to save budget');
      console.error('Budget save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Housing',
    'Other'
  ];

  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-gray-100" onClick={(e) => e.stopPropagation()}>
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6 border-b border-gray-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  {budget ? '✏️' : '📊'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {budget ? 'Edit Budget' : 'Add New Budget'}
                  </h2>
                  <p className="text-gray-600">
                    {budget ? 'Update your budget details' : 'Set spending limits and track expenses'}
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
          <form id="budget-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 text-red-500">⚠️</div>
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Category and Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <span>Category</span>
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <span>Budget Amount</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                  💡 {budget ? 'Changing this amount will automatically create a transaction' : 'Initial amount will create a budget allocation transaction'}
                </p>
              </div>
            </div>

            {/* Period and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <span>Period</span>
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                  required
                >
                  {periods.map(period => (
                    <option key={period.value} value={period.value}>{period.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 resize-none"
                  rows={3}
                  placeholder="Additional notes about this budget"
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
              form="budget-form"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>{budget ? 'Update Budget' : 'Add Budget'}</span>
                  <span>{budget ? '✏️' : '➕'}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;