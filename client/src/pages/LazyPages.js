import React, { lazy, Suspense } from 'react';

// Lazy load page components
const Dashboard = lazy(() => import('./Dashboard'));
const Transactions = lazy(() => import('./Transactions'));
const Subscriptions = lazy(() => import('./Subscriptions'));
const Savings = lazy(() => import('./Savings'));
const Budgets = lazy(() => import('./Budgets'));
const Investments = lazy(() => import('./Investments'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// Higher-order component for lazy loading
const withLazyLoading = (Component) => {
  return (props) => (
    <Suspense fallback={<PageLoader />}>
      <Component {...props} />
    </Suspense>
  );
};

// Export lazy-loaded components
export const LazyDashboard = withLazyLoading(Dashboard);
export const LazyTransactions = withLazyLoading(Transactions);
export const LazySubscriptions = withLazyLoading(Subscriptions);
export const LazySavings = withLazyLoading(Savings);
export const LazyBudgets = withLazyLoading(Budgets);
export const LazyInvestments = withLazyLoading(Investments);
