import React, { useState } from 'react';
import { useFinanceContext } from '../contexts/ContextContext';
import { useNotification } from './NotificationSystem';
import ContextModal from './ContextModal';

const ContextSelector = () => {
  const { 
    contexts, 
    currentContext, 
    switchContext, 
    deleteContext,
    loading, 
    error 
  } = useFinanceContext();
  const { success, error: showError } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [editingContext, setEditingContext] = useState(null);

  const handleContextChange = (context) => {
    switchContext(context);
  };

  const handleEdit = (context) => {
    setEditingContext(context);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingContext(null);
  };

  const handleContextSave = (savedContext) => {
    // The context will be updated in the ContextContext
    handleModalClose();
  };

  const handleDelete = async (context) => {
    // Prevent deleting the last context
    if (contexts.length <= 1) {
      showError('Cannot delete the last context. You need at least one context.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${context.name}"? This will also delete all associated transactions, budgets, and other data.`)) {
      try {
        await deleteContext(context.id);
        success(`Context "${context.name}" deleted successfully!`);
      } catch (err) {
        console.error('Failed to delete context:', err);
        showError('Failed to delete context. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="loading-spinner w-6 h-6"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Context</h3>
        <button
          onClick={() => setShowModal(true)}
          className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          title="Add new context"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {contexts.length > 0 ? (
        <div className="space-y-2">
          {contexts.map((context) => (
            <div
              key={context.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                currentContext?.id === context.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
              onClick={() => handleContextChange(context)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold ${
                    currentContext?.id === context.id
                      ? 'bg-blue-500'
                      : 'bg-gray-500'
                  }`}>
                    {context.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{context.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{context.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(context);
                    }}
                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit context"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(context);
                    }}
                    className={`p-1 rounded transition-colors ${
                      contexts.length <= 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title={contexts.length <= 1 ? "Cannot delete the last context" : "Delete context"}
                    disabled={contexts.length <= 1}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-3">No contexts yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm"
          >
            Create Context
          </button>
        </div>
      )}

      {/* Context Modal */}
      {showModal && (
        <ContextModal
          context={editingContext}
          onClose={handleModalClose}
          onSave={handleContextSave}
        />
      )}
    </div>
  );
};

export default ContextSelector;