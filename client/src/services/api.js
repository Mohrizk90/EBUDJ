const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Contexts API
export const getContexts = () => apiRequest('/api/contexts');
export const createContext = (contextData) => 
  apiRequest('/api/contexts', {
    method: 'POST',
    body: JSON.stringify(contextData),
  });
export const updateContext = (id, contextData) => 
  apiRequest(`/api/contexts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(contextData),
  });
export const deleteContext = (id) => 
  apiRequest(`/api/contexts/${id}`, {
    method: 'DELETE',
  });

// Transactions API
export const getTransactions = (contextId) => 
  apiRequest(`/api/transactions?context_id=${contextId}`);
export const createTransaction = (transactionData) => 
  apiRequest('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(transactionData),
  });
export const updateTransaction = (id, transactionData) => 
  apiRequest(`/api/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(transactionData),
  });
export const deleteTransaction = (id) => 
  apiRequest(`/api/transactions/${id}`, {
    method: 'DELETE',
  });

// Subscriptions API
export const getSubscriptions = (contextId) => 
  apiRequest(`/api/subscriptions?context_id=${contextId}`);
export const createSubscription = (subscriptionData) => 
  apiRequest('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify(subscriptionData),
  });
export const updateSubscription = (id, subscriptionData) => 
  apiRequest(`/api/subscriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(subscriptionData),
  });
export const deleteSubscription = (id) => 
  apiRequest(`/api/subscriptions/${id}`, {
    method: 'DELETE',
  });

// Savings API
export const getSavings = (contextId) => 
  apiRequest(`/api/savings?context_id=${contextId}`);
export const createSaving = (savingData) => 
  apiRequest('/api/savings', {
    method: 'POST',
    body: JSON.stringify(savingData),
  });
export const updateSaving = (id, savingData) => 
  apiRequest(`/api/savings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(savingData),
  });
export const deleteSaving = (id) => 
  apiRequest(`/api/savings/${id}`, {
    method: 'DELETE',
  });

// Budgets API
export const getBudgets = (contextId, month) => 
  apiRequest(`/api/budgets?context_id=${contextId}&month=${month}`);
export const createBudget = (budgetData) => 
  apiRequest('/api/budgets', {
    method: 'POST',
    body: JSON.stringify(budgetData),
  });
export const updateBudget = (id, budgetData) => 
  apiRequest(`/api/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(budgetData),
  });
export const deleteBudget = (id) => 
  apiRequest(`/api/budgets/${id}`, {
    method: 'DELETE',
  });

// Investments API
export const getInvestments = (contextId) => 
  apiRequest(`/api/investments?context_id=${contextId}`);
export const createInvestment = (investmentData) => 
  apiRequest('/api/investments', {
    method: 'POST',
    body: JSON.stringify(investmentData),
  });
export const updateInvestment = (id, investmentData) => 
  apiRequest(`/api/investments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(investmentData),
  });
export const deleteInvestment = (id) => 
  apiRequest(`/api/investments/${id}`, {
    method: 'DELETE',
  });

// Dashboard API
export const getDashboardData = (contextId) => 
  apiRequest(`/api/dashboard?context_id=${contextId}`);

// Utility functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatMonth = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
};

export const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7);
};
