import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFinanceContext } from '../contexts/ContextContext';
import { useContexts, useCreateContext } from '../hooks/useApiSimple';
import { LoadingSpinner } from '../components/LoadingSkeleton';

const ContextSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { switchContext } = useFinanceContext();
  const { data: contexts, isLoading, error } = useContexts();
  const createContextMutation = useCreateContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newContext, setNewContext] = useState({ name: '', type: 'Home' });

  const handleContextSelect = (context) => {
    switchContext(context);
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  const handleCreateContext = async (e) => {
    e.preventDefault();
    try {
      const createdContext = await createContextMutation.mutateAsync(newContext);
      setNewContext({ name: '', type: 'Home' });
      setShowCreateForm(false);
      handleContextSelect(createdContext);
    } catch (error) {
      console.error('Failed to create context:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading contexts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load contexts
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error.message || 'Something went wrong'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">💰</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Finance Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Select a context to get started
            </p>
          </div>

          {contexts && contexts.length > 0 ? (
            <div className="space-y-3 mb-6">
              {contexts.map((context) => (
                <button
                  key={context.id}
                  onClick={() => handleContextSelect(context)}
                  className="w-full p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {context.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {context.type} Context
                      </p>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No contexts found. Create your first context to get started.
              </p>
            </div>
          )}

          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Context
            </button>
          ) : (
            <form onSubmit={handleCreateContext} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Context Name
                </label>
                <input
                  type="text"
                  value={newContext.name}
                  onChange={(e) => setNewContext({ ...newContext, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., My Home, Work Expenses"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Context Type
                </label>
                <select
                  value={newContext.type}
                  onChange={(e) => setNewContext({ ...newContext, type: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createContextMutation.isPending}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {createContextMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContextSelection;
