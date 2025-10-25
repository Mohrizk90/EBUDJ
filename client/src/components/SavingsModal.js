import React, { useState, useEffect } from 'react';
import { createSaving, updateSaving, createTransaction } from '../services/api';
import { useFinanceContext } from '../contexts/ContextContext';

const SavingsModal = ({ savings, onClose, onSave }) => {
  const { currentContext } = useFinanceContext();
  const [formData, setFormData] = useState({
    account: '',
    amount: '',
    goal: '',
    date: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (savings) {
      setFormData({
        account: savings.account || '',
        amount: savings.amount || '',
        goal: savings.goal || '',
        date: savings.date || '',
        description: savings.description || ''
      });
    }
  }, [savings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!currentContext) {
        throw new Error('No context selected. Please select a context first.');
      }

      const parsedAmount = formData.amount === '' ? 0 : parseFloat(formData.amount);
      const parsedGoal = formData.goal === '' ? 0 : parseFloat(formData.goal);
      
      const savingsData = {
        ...formData,
        amount: isNaN(parsedAmount) ? 0 : parsedAmount,
        goal: isNaN(parsedGoal) ? 0 : parsedGoal,
        context_id: currentContext.id
      };

      console.log('Savings data being sent:', savingsData);

      let savedSavings;
      if (savings) {
        // Check if amount changed for existing savings
        const oldAmount = parseFloat(savings.amount) || 0;
        const newAmount = formData.amount === '' ? 0 : parseFloat(formData.amount);
        const amountDifference = newAmount - oldAmount;
        
        savedSavings = await updateSaving(savings.id, savingsData);
        
        // Create transaction if amount changed
        if (amountDifference !== 0) {
          const transactionData = {
            context_id: currentContext.id,
            description: `Savings adjustment for ${formData.account}`,
            date: new Date().toISOString(),
            category: 'Savings',
            type: amountDifference > 0 ? 'Expense' : 'Income',
            amount: Math.abs(amountDifference),
            account: formData.account,
            notes: `Automatic transaction from savings goal adjustment. ${amountDifference > 0 ? 'Added to savings' : 'Withdrawn from savings'}.`
          };
          
          console.log('Creating automatic transaction:', transactionData);
          await createTransaction(transactionData);
        }
      } else {
        // For new savings, create initial transaction if amount > 0
        savedSavings = await createSaving(savingsData);
        
        const initialAmount = formData.amount === '' ? 0 : parseFloat(formData.amount);
        if (initialAmount > 0) {
          const transactionData = {
            context_id: currentContext.id,
            description: `Initial savings for ${formData.account}`,
            date: new Date().toISOString(),
            category: 'Savings',
            type: 'Expense',
            amount: initialAmount,
            account: formData.account,
            notes: `Initial deposit to savings goal: ${formData.account}`
          };
          
          console.log('Creating initial savings transaction:', transactionData);
          await createTransaction(transactionData);
        }
      }

      onSave(savedSavings);
    } catch (err) {
      setError('Failed to save savings goal');
      console.error('Savings save error:', err);
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


  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-gray-100" onClick={(e) => e.stopPropagation()}>
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 border-b border-gray-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  {savings ? '✏️' : '💰'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {savings ? 'Edit Savings Goal' : 'Add New Savings Goal'}
                  </h2>
                  <p className="text-gray-600">
                    {savings ? 'Update your savings goal' : 'Set a new savings target'}
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
          <form id="savings-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 text-red-500">⚠️</div>
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Account Name and Current Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <span>Account Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="account"
                  value={formData.account}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                  placeholder="e.g., Emergency Fund, Vacation"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">
                  Current Amount
                </label>
                {savings ? (
                  <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    💡 Changing this amount will automatically create a transaction (zero is allowed)
                  </p>
                ) : (
                  <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    💡 Initial amount will create an expense transaction (zero creates no transaction)
                  </p>
                )}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                    placeholder="0.00 (zero is allowed)"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Goal Amount and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <span>Goal Amount</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Target Date (Optional)</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 resize-none"
                rows={3}
                placeholder="Additional notes about this savings goal"
              />
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
              form="savings-form"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>{savings ? 'Update Savings Goal' : 'Add Savings Goal'}</span>
                  <span>{savings ? '✏️' : '➕'}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsModal;