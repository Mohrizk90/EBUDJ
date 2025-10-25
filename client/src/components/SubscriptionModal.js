import React, { useState, useEffect } from 'react';
import { createSubscription, updateSubscription } from '../services/api';
import { useFinanceContext } from '../contexts/ContextContext';

const SubscriptionModal = ({ subscription, onClose, onSave }) => {
  const { currentContext } = useFinanceContext();
  const [formData, setFormData] = useState({
    service: '',
    amount: '',
    frequency: 'monthly',
    next_billing_date: '',
    status: 'Active',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subscription) {
      setFormData({
        service: subscription.service || '',
        amount: subscription.amount || '',
        frequency: subscription.frequency || 'monthly',
        next_billing_date: subscription.next_billing_date ? subscription.next_billing_date.split('T')[0] : '',
        status: subscription.status || 'Active',
        description: subscription.description || ''
      });
    }
  }, [subscription]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!currentContext) {
        throw new Error('No context selected. Please select a context first.');
      }

      const subscriptionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        context_id: currentContext.id
      };

      console.log('Subscription data being sent:', subscriptionData);

      let savedSubscription;
      if (subscription) {
        savedSubscription = await updateSubscription(subscription.id, subscriptionData);
      } else {
        savedSubscription = await createSubscription(subscriptionData);
      }

      onSave(savedSubscription);
    } catch (err) {
      setError('Failed to save subscription');
      console.error('Subscription save error:', err);
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


  const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'daily', label: 'Daily' }
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-gray-100" onClick={(e) => e.stopPropagation()}>
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6 border-b border-gray-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-400/20 to-rose-400/20 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  {subscription ? '✏️' : '🔄'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {subscription ? 'Edit Subscription' : 'Add New Subscription'}
                  </h2>
                  <p className="text-gray-600">
                    {subscription ? 'Update your subscription details' : 'Track your recurring payments'}
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
          <form id="subscription-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 text-red-500">⚠️</div>
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Service Name and Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <span>Service Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                  placeholder="e.g., Netflix, Spotify"
                  required
                />
              </div>

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
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Frequency and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <span>Frequency</span>
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                  required
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <span>Status</span>
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Next Billing Date and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                  <span>Next Billing Date</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="next_billing_date"
                  value={formData.next_billing_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 resize-none"
                  rows={3}
                  placeholder="Additional notes about this subscription"
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
              form="subscription-form"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>{subscription ? 'Update Subscription' : 'Add Subscription'}</span>
                  <span>{subscription ? '✏️' : '➕'}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;