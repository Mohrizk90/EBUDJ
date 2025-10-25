// Route configuration
export const ROUTES = {
  // Public routes
  CONTEXTS: '/contexts',
  
  // Protected routes
  DASHBOARD: '/',
  TRANSACTIONS: '/transactions',
  SUBSCRIPTIONS: '/subscriptions',
  SAVINGS: '/savings',
  BUDGETS: '/budgets',
  INVESTMENTS: '/investments',
};

// Route metadata
export const ROUTE_CONFIG = {
  [ROUTES.CONTEXTS]: {
    title: 'Select Context',
    description: 'Choose a finance context to get started',
    public: true,
  },
  [ROUTES.DASHBOARD]: {
    title: 'Dashboard',
    description: 'Overview of your financial data',
    icon: '📊',
    protected: true,
  },
  [ROUTES.TRANSACTIONS]: {
    title: 'Transactions',
    description: 'Manage your income and expenses',
    icon: '💳',
    protected: true,
  },
  [ROUTES.SUBSCRIPTIONS]: {
    title: 'Subscriptions',
    description: 'Track your recurring subscriptions',
    icon: '🔄',
    protected: true,
  },
  [ROUTES.SAVINGS]: {
    title: 'Savings',
    description: 'Monitor your savings goals',
    icon: '💰',
    protected: true,
  },
  [ROUTES.BUDGETS]: {
    title: 'Budgets',
    description: 'Set and track your spending limits',
    icon: '📈',
    protected: true,
  },
  [ROUTES.INVESTMENTS]: {
    title: 'Investments',
    description: 'Track your investment portfolio',
    icon: '📈',
    protected: true,
  },
};

// Navigation items for sidebar
export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: '📊',
  },
  {
    name: 'Transactions',
    href: ROUTES.TRANSACTIONS,
    icon: '💳',
  },
  {
    name: 'Subscriptions',
    href: ROUTES.SUBSCRIPTIONS,
    icon: '🔄',
  },
  {
    name: 'Savings',
    href: ROUTES.SAVINGS,
    icon: '💰',
  },
  {
    name: 'Budgets',
    href: ROUTES.BUDGETS,
    icon: '📈',
  },
  {
    name: 'Investments',
    href: ROUTES.INVESTMENTS,
    icon: '📈',
  },
];

// Helper functions
export const getRouteConfig = (path) => ROUTE_CONFIG[path] || {};

export const isProtectedRoute = (path) => {
  const config = getRouteConfig(path);
  return config.protected === true;
};

export const isPublicRoute = (path) => {
  const config = getRouteConfig(path);
  return config.public === true;
};

export const getRouteTitle = (path) => {
  const config = getRouteConfig(path);
  return config.title || 'Finance Tracker';
};

export const getRouteDescription = (path) => {
  const config = getRouteConfig(path);
  return config.description || '';
};
