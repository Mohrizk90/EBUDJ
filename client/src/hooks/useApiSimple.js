import { useState, useEffect } from 'react';

// Simple API hooks without React Query for basic functionality
export const useApiQuery = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fullUrl = endpoint.startsWith('http') ? endpoint : `http://localhost:5000${endpoint}`;
        const response = await fetch(fullUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (options.enabled !== false) {
      fetchData();
    }
  }, [endpoint, options.enabled]);

  return { data, isLoading, error, refetch: () => window.location.reload() };
};

export const useApiMutation = (endpoint, method = 'POST') => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  const mutateAsync = async (data) => {
    try {
      setIsPending(true);
      setError(null);
      
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      const fullUrl = endpoint.startsWith('http') ? endpoint : `http://localhost:5000${endpoint}`;
      const response = await fetch(fullUrl, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending, error };
};

// Contexts API hooks
export const useContexts = () => {
  return useApiQuery('/api/contexts');
};

export const useCreateContext = () => {
  return useApiMutation('/api/contexts', 'POST');
};

// Transactions API hooks
export const useTransactions = (contextId) => {
  return useApiQuery(
    `/api/transactions?context_id=${contextId}`,
    { enabled: !!contextId }
  );
};

export const useCreateTransaction = () => {
  return useApiMutation('/api/transactions', 'POST');
};

export const useUpdateTransaction = () => {
  return {
    mutateAsync: async ({ id, data }) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    },
    isPending: false,
    error: null,
  };
};

export const useDeleteTransaction = () => {
  return {
    mutateAsync: async ({ id }) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    },
    isPending: false,
    error: null,
  };
};

// Dashboard API hooks
export const useDashboardData = (contextId) => {
  return useApiQuery(
    `/api/dashboard?context_id=${contextId}`,
    { enabled: !!contextId }
  );
};
