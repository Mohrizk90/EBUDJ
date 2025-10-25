import React, { useState, useEffect } from 'react';
import { createInvestment, updateInvestment } from '../services/api';
import { useFinanceContext } from '../contexts/ContextContext';

const InvestmentModal = ({ investment, onClose, onSave }) => {
  const { currentContext } = useFinanceContext();
  const [formData, setFormData] = useState({
    asset_name: '',
    type: 'Stock',
    amount_invested: '',
    current_value: '',
    date_invested: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (investment) {
      setFormData({
        asset_name: investment.asset_name || '',
        type: investment.type || 'Stock',
        amount_invested: investment.amount_invested || '',
        current_value: investment.current_value || '',
        date_invested: investment.date_invested || '',
        notes: investment.notes || ''
      });
    }
  }, [investment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!currentContext) {
      setError('Please select a context first');
      setLoading(false);
      return;
    }

    try {
      const investmentData = {
        ...formData,
        amount_invested: parseFloat(formData.amount_invested),
        current_value: parseFloat(formData.current_value) || parseFloat(formData.amount_invested),
        context_id: currentContext.id
      };

      let savedInvestment;
      if (investment) {
        savedInvestment = await updateInvestment(investment.id, investmentData);
      } else {
        savedInvestment = await createInvestment(investmentData);
      }

      onSave(savedInvestment);
    } catch (err) {
      setError('Failed to save investment');
      console.error('Investment save error:', err);
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

  const investmentTypes = [
    { value: 'Stock', label: 'Stock', icon: '📈' },
    { value: 'Bond', label: 'Bond', icon: '📊' },
    { value: 'Mutual Fund', label: 'Mutual Fund', icon: '🏦' },
    { value: 'ETF', label: 'ETF', icon: '📋' },
    { value: 'Crypto', label: 'Cryptocurrency', icon: '₿' },
    { value: 'Real Estate', label: 'Real Estate', icon: '🏠' },
    { value: 'Commodity', label: 'Commodity', icon: '🥇' },
    { value: 'REIT', label: 'REIT', icon: '🏢' },
    { value: 'Options', label: 'Options', icon: '⚡' },
    { value: 'Futures', label: 'Futures', icon: '⏰' },
    { value: 'Forex', label: 'Forex', icon: '💱' },
    { value: 'Other', label: 'Other', icon: '📦' }
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-gray-100" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
              📈
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {investment ? 'Edit Investment' : 'Add New Investment'}
              </h2>
              <p className="text-sm text-gray-600">
                {investment ? 'Update your investment details' : 'Track a new investment in your portfolio'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Asset Name</label>
                <input
                  type="text"
                  name="asset_name"
                  value={formData.asset_name}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Apple Inc., S&P 500 ETF"
                  required
                />
              </div>

              <div>
                <label className="label">Investment Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="select"
                  required
                >
                  {investmentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Amount Invested</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="amount_invested"
                    value={formData.amount_invested}
                    onChange={handleChange}
                    className="input pl-8"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Current Value</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="current_value"
                    value={formData.current_value}
                    onChange={handleChange}
                    className="input pl-8"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use initial investment amount
                </p>
                {formData.amount_invested && formData.current_value && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Gain/Loss:</span>
                      <span className={`font-medium ${
                        (parseFloat(formData.current_value) - parseFloat(formData.amount_invested)) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {(parseFloat(formData.current_value) - parseFloat(formData.amount_invested)) >= 0 ? '+' : ''}
                        ${(parseFloat(formData.current_value) - parseFloat(formData.amount_invested)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Return:</span>
                      <span className={`font-medium ${
                        (parseFloat(formData.current_value) - parseFloat(formData.amount_invested)) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {(parseFloat(formData.current_value) - parseFloat(formData.amount_invested)) >= 0 ? '+' : ''}
                        {parseFloat(formData.amount_invested) > 0 
                          ? (((parseFloat(formData.current_value) - parseFloat(formData.amount_invested)) / parseFloat(formData.amount_invested)) * 100).toFixed(2)
                          : '0.00'
                        }%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="label">Date Invested *</label>
              <input
                type="date"
                name="date_invested"
                value={formData.date_invested}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="textarea"
                rows={3}
                placeholder="Additional notes about this investment..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary shadow-glow"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  {investment ? 'Updating...' : 'Adding...'}
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {investment ? 'Update Investment' : 'Add Investment'}
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvestmentModal;