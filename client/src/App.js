import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ContextProvider } from './contexts/ContextContext';
import { ThemeProvider } from './contexts/ThemeContext';
// import { QueryProvider } from './providers/QueryProvider';
import { NotificationProvider } from './components/NotificationSystem';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import OfflineIndicator from './components/OfflineIndicator';
import Layout from './components/Layout';
import ContextSelection from './pages/ContextSelection';
import { 
  LazyDashboard, 
  LazyTransactions, 
  LazySubscriptions, 
  LazySavings, 
  LazyBudgets, 
  LazyInvestments 
} from './pages/LazyPages';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <ContextProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <OfflineIndicator />
                <Routes>
                    {/* Public routes */}
                    <Route path="/contexts" element={<ContextSelection />} />
                    
                    {/* Protected routes */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Layout>
                          <LazyDashboard />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/transactions" element={
                      <ProtectedRoute>
                        <Layout>
                          <LazyTransactions />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/subscriptions" element={
                      <ProtectedRoute>
                        <Layout>
                          <LazySubscriptions />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/savings" element={
                      <ProtectedRoute>
                        <Layout>
                          <LazySavings />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/budgets" element={
                      <ProtectedRoute>
                        <Layout>
                          <LazyBudgets />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/investments" element={
                      <ProtectedRoute>
                        <Layout>
                          <LazyInvestments />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </Router>
          </ContextProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;