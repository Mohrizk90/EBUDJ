import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useContexts } from '../hooks/useApiSimple';

const ContextContext = createContext();

export const useFinanceContext = () => {
  const context = useContext(ContextContext);
  if (!context) {
    throw new Error('useFinanceContext must be used within a ContextProvider');
  }
  return context;
};

export const ContextProvider = ({ children }) => {
  const [currentContext, setCurrentContext] = useState(null);
  const { data: contexts, isLoading, error, refetch } = useContexts();

  // Set current context when contexts are loaded
  useEffect(() => {
    if (contexts && contexts.length > 0) {
      // Try to restore the previously selected context from localStorage
      const savedContext = localStorage.getItem('selectedContext');
      if (savedContext) {
        try {
          const parsedContext = JSON.parse(savedContext);
          // Check if the saved context still exists in the current contexts
          const foundContext = contexts.find(c => c.id === parsedContext.id);
          if (foundContext) {
            setCurrentContext(foundContext);
            return;
          }
        } catch (e) {
          // If parsing fails, continue to default selection
        }
      }
      
      // If no saved context or saved context not found, use the first available
      if (!currentContext) {
        setCurrentContext(contexts[0]);
      }
    }
  }, [contexts, currentContext]);

  const addContext = async (contextData) => {
    // This will be handled by the API hooks in components
    throw new Error('Use useCreateContext hook instead');
  };

  const updateContext = async (id, contextData) => {
    // This will be handled by the API hooks in components
    throw new Error('Use useUpdateContext hook instead');
  };

  const deleteContext = async (id) => {
    // This will be handled by the API hooks in components
    throw new Error('Use useDeleteContext hook instead');
  };

  const switchContext = (context) => {
    setCurrentContext(context);
    // Store the selected context in localStorage for persistence
    localStorage.setItem('selectedContext', JSON.stringify(context));
  };

  const refreshContexts = useCallback(() => {
    refetch();
  }, [refetch]);

  const value = {
    contexts: contexts || [],
    currentContext,
    loading: isLoading,
    error,
    addContext,
    updateContext,
    deleteContext,
    switchContext,
    refreshContexts,
    setError: () => {} // Error handling is now done by React Query
  };

  return (
    <ContextContext.Provider value={value}>
      {children}
    </ContextContext.Provider>
  );
};
