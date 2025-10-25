import React, { useState, useEffect } from 'react';
import { useFinanceContext } from '../contexts/ContextContext';
import { useNotification } from './NotificationSystem';

const ContextModal = ({ context, onClose, onSave }) => {
  const { addContext, updateContext, refreshContexts } = useFinanceContext();
  const { success, error: showError } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    type: 'Home'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (context) {
      setFormData({
        name: context.name || '',
        type: context.type || 'Home'
      });
    }
  }, [context]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let savedContext;
      if (context) {
        savedContext = await updateContext(context.id, formData);
      } else {
        savedContext = await addContext(formData);
      }
      
      // Refresh contexts to ensure UI is up to date
      await refreshContexts();
      success(context ? `Context "${savedContext.name}" updated successfully!` : `Context "${savedContext.name}" created successfully!`);
      onSave(savedContext);
    } catch (err) {
      const errorMessage = context ? 'Failed to update context' : 'Failed to create context';
      setError(errorMessage);
      showError(errorMessage + '. Please try again.');
      console.error('Context save error:', err);
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

  const contextTypes = [
    'Home',
    'Work',
    'Business'
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-gray-100" onClick={(e) => e.stopPropagation()}>
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 border-b border-gray-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-400/20 to-rose-400/20 rounded-full translate-y-8 -translate-x-8"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  {context ? '✏️' : '🏠'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {context ? 'Edit Context' : 'Add New Context'}
                  </h2>
                  <p className="text-gray-600">
                    {context ? 'Update your finance context' : 'Create a new finance context'}
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
          <form id="context-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 text-red-500">⚠️</div>
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Context Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <span>Context Name</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                placeholder="e.g., My Personal Finance, Business Account"
                required
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <span>Type</span>
                <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                required
              >
                {contextTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
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
              form="context-form"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{context ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>{context ? 'Update Context' : 'Create Context'}</span>
                  <span>{context ? '✏️' : '➕'}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextModal;