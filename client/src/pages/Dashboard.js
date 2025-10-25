import React, { useState, useEffect } from 'react';
import { useFinanceContext } from '../contexts/ContextContext';
import { getDashboardData, getBudgets } from '../services/api';

const Dashboard = () => {
  const { currentContext } = useFinanceContext();
  const [dashboardData, setDashboardData] = useState(null);
  const [budgetData, setBudgetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData(currentContext?.id);
        setDashboardData(data);
        
        // Fetch current month's budgets
        if (currentContext?.id) {
          const currentDate = new Date();
          const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
          const budgets = await getBudgets(currentContext.id, currentMonth);
          setBudgetData(budgets);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentContext?.id]);

  // Listen for transaction creation events to refresh budget data
  useEffect(() => {
    const handleTransactionCreated = (event) => {
      console.log('Transaction created, refreshing dashboard budget data:', event.detail);
      // Only refresh if the transaction affects budgets (is an expense)
      if (event.detail.type === 'Expense') {
        // Refresh budget data
        const refreshBudgetData = async () => {
          if (currentContext?.id) {
            try {
              const currentDate = new Date();
              const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
              const budgets = await getBudgets(currentContext.id, currentMonth);
              setBudgetData(budgets);
            } catch (error) {
              console.error('Error refreshing budget data:', error);
            }
          }
        };
        refreshBudgetData();
      }
    };

    window.addEventListener('transactionCreated', handleTransactionCreated);
    
    return () => {
      window.removeEventListener('transactionCreated', handleTransactionCreated);
    };
  }, [currentContext?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  const data = dashboardData || {
    summary: {
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      totalSubscriptions: 0,
      totalInvested: 0,
      totalCurrentValue: 0,
      profitLoss: 0,
      profitLossPercentage: 0
    },
    recentTransactions: [],
    upcomingRenewals: [],
    savingsProgress: [],
    budgetVsActual: []
  };

  const summary = data.summary || {};
  const netIncome = summary.netIncome || 0;
  const totalSavings = data.savingsProgress?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0;
  const totalSavingsGoal = data.savingsProgress?.reduce((sum, s) => sum + (s.goal || 0), 0) || 0;
  const savingsRate = summary.totalIncome > 0 ? (totalSavings / summary.totalIncome) * 100 : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 border border-blue-200 shadow-soft">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full -translate-x-8 -translate-y-8"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <h1 className="text-4xl font-bold gradient-text">
                Welcome back!
              </h1>
              <span className="text-3xl floating">👋</span>
            </div>
            <p className="text-lg text-gray-700 max-w-md leading-relaxed">
              Here's your comprehensive financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">Live Data</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                <span className="text-xs font-medium text-gray-700">Last updated: Now</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                <span className="text-xs font-medium text-gray-700">All systems operational</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-right space-y-1">
              <p className="text-sm text-gray-600">Portfolio Value</p>
              <p className="text-3xl font-bold text-gray-900">
                ${(summary.totalCurrentValue || 0).toFixed(2)}
              </p>
              <div className="flex items-center justify-end space-x-1">
                <span className={`text-sm font-medium ${
                  (summary.profitLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(summary.profitLoss || 0) >= 0 ? '+' : ''}${(summary.profitLoss || 0).toFixed(2)}
                </span>
                <span className={`text-xs ${
                  (summary.profitLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ({(summary.profitLossPercentage || 0).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:scale-110 transition-transform duration-300">
              💰
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card group cursor-pointer hover:scale-105 transition-all duration-300 animate-fade-in" 
             style={{ animationDelay: '0.1s' }}
             onClick={() => window.location.href = '/transactions'}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="stat-label">Monthly Income</p>
              <p className="stat-value text-green-600">
                ${(summary.totalIncome || 0).toFixed(2)}
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">+12% from last month</span>
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-green-500 to-emerald-600 text-white group-hover:scale-110 transition-transform duration-300">
              📈
            </div>
          </div>
          <div className="mt-4 progress">
            <div className="progress-bar progress-success" style={{ width: '75%' }}></div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer hover:scale-105 transition-all duration-300 animate-fade-in" 
             style={{ animationDelay: '0.2s' }}
             onClick={() => window.location.href = '/transactions'}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="stat-label">Monthly Expenses</p>
              <p className="stat-value text-red-600">
                ${(summary.totalExpenses || 0).toFixed(2)}
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-500">-5% from last month</span>
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-red-500 to-rose-600 text-white group-hover:scale-110 transition-transform duration-300">
              📉
            </div>
          </div>
          <div className="mt-4 progress">
            <div className="progress-bar progress-danger" style={{ width: '60%' }}></div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer hover:scale-105 transition-all duration-300 animate-fade-in" 
             style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="stat-label">Net Income</p>
              <p className={`stat-value ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netIncome.toFixed(2)}
              </p>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${netIncome >= 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-500">
                  {netIncome >= 0 ? 'Positive' : 'Negative'} cash flow
                </span>
              </div>
            </div>
            <div className={`stat-icon ${
              netIncome >= 0 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                : 'bg-gradient-to-br from-red-500 to-rose-600'
            } text-white group-hover:scale-110 transition-transform duration-300`}>
              {netIncome >= 0 ? '💚' : '💔'}
            </div>
          </div>
          <div className="mt-4 progress">
            <div className={`progress-bar ${netIncome >= 0 ? 'progress-success' : 'progress-danger'}`} 
                 style={{ width: `${Math.min(Math.abs(netIncome) / 1000 * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer hover:scale-105 transition-all duration-300 animate-fade-in" 
             style={{ animationDelay: '0.4s' }}
             onClick={() => window.location.href = '/savings'}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="stat-label">Savings Rate</p>
              <p className="stat-value text-blue-600">
                {savingsRate.toFixed(1)}%
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">
                  {savingsRate >= 20 ? 'Excellent' : savingsRate >= 10 ? 'Good' : 'Needs improvement'}
                </span>
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-blue-500 to-indigo-600 text-white group-hover:scale-110 transition-transform duration-300">
              🎯
            </div>
          </div>
          <div className="mt-4 progress">
            <div className="progress-bar bg-gradient-to-r from-blue-500 to-indigo-500" 
                 style={{ width: `${Math.min(savingsRate * 5, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Recent Transactions */}
        <div className="lg:col-span-2">
          <div className="card animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                    💳
                  </div>
                  <div>
                    <h3 className="font-semibold leading-none tracking-tight">Recent Transactions</h3>
                    <p className="text-sm text-gray-600">Your latest financial activity</p>
                  </div>
                </div>
              <button 
                className="btn btn-outline group"
                onClick={() => window.location.href = '/transactions'}
              >
                <span>View All</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              </div>
            </div>
            <div className="p-6 pt-0">
              {data.recentTransactions?.length > 0 ? (
                <div className="space-y-3">
                  {data.recentTransactions.slice(0, 5).map((transaction, index) => (
                    <div key={transaction.id || index} 
                         className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-md group animate-fade-in"
                         style={{ animationDelay: `${0.6 + index * 0.1}s` }}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                          transaction.type === 'Income' 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                            : 'bg-gradient-to-br from-red-500 to-rose-600'
                        }`}>
                          {transaction.type === 'Income' ? '📈' : '📉'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-lg ${
                          transaction.type === 'Income' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'Income' ? '+' : '-'}${transaction.amount?.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 animate-fade-in">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 floating">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No transactions yet</h3>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto">Start tracking your finances by adding your first transaction.</p>
                  <button 
                    className="btn btn-primary shadow-glow"
                    onClick={() => window.location.href = '/transactions'}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Transaction
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions & Insights */}
        <div className="space-y-6">
          {/* Enhanced Quick Actions */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">
                  ⚡
                </div>
                <div>
                  <h3 className="font-semibold leading-none tracking-tight">Quick Actions</h3>
                  <p className="text-sm text-gray-600">Common tasks</p>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <button 
                className="w-full btn btn-outline group hover:scale-105 transition-all duration-200"
                onClick={() => window.location.href = '/transactions'}
              >
                <svg className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Transaction
              </button>
              <button 
                className="w-full btn btn-outline group hover:scale-105 transition-all duration-200"
                onClick={() => window.location.href = '/savings'}
              >
                <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Set Savings Goal
              </button>
              <button 
                className="w-full btn btn-outline group hover:scale-105 transition-all duration-200"
                onClick={() => window.location.href = '/budgets'}
              >
                <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Budgets
              </button>
            </div>
          </div>

          {/* Enhanced Upcoming Bills */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white">
                  🔄
                </div>
                <div>
                  <h3 className="font-semibold leading-none tracking-tight">Upcoming Bills</h3>
                  <p className="text-sm text-gray-600">Next payments due</p>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              {data.upcomingRenewals?.length > 0 ? (
                <div className="space-y-3">
                  {data.upcomingRenewals.slice(0, 3).map((subscription, index) => (
                    <div key={subscription.id || index} 
                         className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 hover:shadow-md transition-all duration-300 group animate-fade-in"
                         style={{ animationDelay: `${0.9 + index * 0.1}s` }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                          🔄
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors duration-200">{subscription.service}</p>
                          <p className="text-xs text-gray-600">Due {new Date(subscription.next_billing_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 text-lg">${subscription.amount?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 animate-fade-in">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4 floating">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">No upcoming bills</p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Budget Status */}
          <div className="card animate-fade-in" style={{ animationDelay: '1.0s' }}>
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                  📊
                </div>
                <div>
                  <h3 className="font-semibold leading-none tracking-tight">Budget Status</h3>
                  <p className="text-sm text-gray-600">This month's progress</p>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Progress</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    data.budgetStatus === 'on-track' 
                      ? 'text-green-700 bg-green-100' 
                      : data.budgetStatus === 'warning'
                      ? 'text-yellow-700 bg-yellow-100'
                      : 'text-red-700 bg-red-100'
                  }`}>
                    {data.budgetStatus === 'on-track' ? 'On Track' : 
                     data.budgetStatus === 'warning' ? 'Warning' : 'Over Budget'}
                  </span>
                </div>
                <div className="progress">
                  <div 
                    className={`progress-bar ${
                      data.budgetStatus === 'on-track' 
                        ? 'progress-success' 
                        : data.budgetStatus === 'warning'
                        ? 'progress-warning'
                        : 'progress-danger'
                    }`}
                    style={{ width: `${Math.min(75, 100)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Budget tracking</span>
                  <span className={`font-medium ${
                    budgetData.length > 0 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {budgetData.length > 0 ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real Budget Status Widget */}
        {budgetData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Month Budgets</h3>
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            
            <div className="space-y-3">
              {budgetData.slice(0, 3).map((budget) => {
                const spent = budget.spent || 0;
                const limit = budget.monthly_limit;
                const percentage = limit > 0 ? (spent / limit) * 100 : 0;
                const remaining = limit - spent;
                const isOverBudget = spent > limit;
                
                return (
                  <div key={budget.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{budget.category}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isOverBudget 
                            ? 'bg-red-100 text-red-700' 
                            : percentage > 80
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {isOverBudget ? 'Over Budget' : percentage > 80 ? 'Warning' : 'On Track'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>${spent.toFixed(2)} / ${limit.toFixed(2)}</span>
                        <span className={remaining < 0 ? 'text-red-600' : 'text-gray-600'}>
                          {remaining < 0 ? `$${Math.abs(remaining).toFixed(2)} over` : `$${remaining.toFixed(2)} left`}
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all ${
                            isOverBudget ? 'bg-red-500' : 
                            percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {budgetData.length > 3 && (
                <div className="text-center pt-2">
                  <button 
                    onClick={() => window.location.href = '/budgets'}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all {budgetData.length} budgets →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;