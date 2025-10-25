import React, { useState, useEffect } from 'react';
import { useFinanceContext } from '../contexts/ContextContext';
import { getBudgets, deleteBudget } from '../services/api';
import BudgetModal from '../components/BudgetModal';

const Budgets = () => {
  const { currentContext } = useFinanceContext();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentDate = new Date();
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('category');
  const [sortOrder, setSortOrder] = useState('asc');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        if (currentContext?.id) {
          const data = await getBudgets(currentContext.id, selectedMonth);
          console.log('Fetched budgets data:', data);
          setBudgets(data);
        } else {
          setBudgets([]);
        }
      } catch (err) {
        setError('Failed to load budgets');
        console.error('Budgets error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, [currentContext?.id, selectedMonth, refreshTrigger]);

  // Listen for transaction creation events to refresh budgets
  useEffect(() => {
    const handleTransactionCreated = (event) => {
      console.log('Transaction created, refreshing budgets:', event.detail);
      // Only refresh if the transaction affects budgets (is an expense)
      if (event.detail.type === 'Expense') {
        setRefreshTrigger(prev => prev + 1);
      }
    };

    window.addEventListener('transactionCreated', handleTransactionCreated);
    
    return () => {
      window.removeEventListener('transactionCreated', handleTransactionCreated);
    };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(id);
        setBudgets(budgets.filter(b => b.id !== id));
      } catch (err) {
        setError('Failed to delete budget');
        console.error('Delete error:', err);
      }
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingBudget(null);
  };

  const handleBudgetSave = (savedBudget) => {
    if (editingBudget) {
      setBudgets(budgets.map(b => 
        b.id === savedBudget.id ? savedBudget : b
      ));
    } else {
      setBudgets([savedBudget, ...budgets]);
    }
    handleModalClose();
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Filter and sort budgets
  const filteredBudgets = budgets
    .filter(budget => 
      budget.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.monthly_limit || 0;
          bValue = b.monthly_limit || 0;
          break;
        case 'spent':
          aValue = a.spent || 0;
          bValue = b.spent || 0;
          break;
        case 'remaining':
          aValue = (a.monthly_limit || 0) - (a.spent || 0);
          bValue = (b.monthly_limit || 0) - (b.spent || 0);
          break;
        case 'percentage':
          aValue = (a.monthly_limit || 0) > 0 ? ((a.spent || 0) / (a.monthly_limit || 0)) * 100 : 0;
          bValue = (b.monthly_limit || 0) > 0 ? ((b.spent || 0) / (b.monthly_limit || 0)) * 100 : 0;
          break;
        default:
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const totalBudgeted = budgets.reduce((sum, b) => sum + (b.monthly_limit || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const remainingBudget = totalBudgeted - totalSpent;
  const budgetUtilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-8 border border-purple-200 shadow-soft">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-4xl font-bold gradient-text">Budgets</h1>
              <span className="text-3xl floating">📊</span>
            </div>
            <p className="text-lg text-gray-700 max-w-md">
              Track your spending limits and stay on budget with smart insights
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">Budget Control</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-xs font-medium text-gray-700">{budgets.length} Budgets</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1">
              <label className="text-xs font-medium text-gray-700">Month:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs bg-transparent border-none outline-none text-gray-700"
              />
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white/60 rounded-lg transition-all duration-200 hover:scale-105"
              title="Refresh budgets"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary shadow-glow hover:shadow-lg group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Budget
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Budgeted</p>
                <p className="text-2xl font-bold">${totalBudgeted.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                💰
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">${totalSpent.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl">
                📉
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${remainingBudget.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  {budgetUtilization.toFixed(1)}% utilized
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                remainingBudget >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {remainingBudget >= 0 ? '✅' : '⚠️'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      {budgets.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Overall Budget Progress</h3>
              <span className="text-sm text-gray-600">
                ${totalSpent.toFixed(2)} of ${totalBudgeted.toFixed(2)}
              </span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div 
                className={`h-full w-full flex-1 transition-all ${
                  budgetUtilization > 100 ? 'bg-red-500' : 
                  budgetUtilization > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>0%</span>
              <span className={budgetUtilization > 100 ? 'text-red-600 font-semibold' : ''}>
                {budgetUtilization.toFixed(1)}%
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>
      )}

      {/* Search and Sort Controls */}
      {budgets.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search budgets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="category">Category</option>
                  <option value="amount">Budget Amount</option>
                  <option value="spent">Amount Spent</option>
                  <option value="remaining">Remaining</option>
                  <option value="percentage">Usage %</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {filteredBudgets.length} of {budgets.length} budgets
            </div>
          </div>
        </div>
      )}

      {/* Budgets Grid */}
      {filteredBudgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBudgets.map((budget, index) => {
            const spent = budget.spent || 0;
            const amount = budget.monthly_limit || 0;
            const remaining = amount - spent;
            const percentage = amount > 0 ? (spent / amount) * 100 : 0;
            const isOverBudget = spent > amount;
            
            console.log('Budget display data:', { 
              category: budget.category, 
              spent, 
              amount, 
              remaining, 
              percentage, 
              isOverBudget,
              rawBudget: budget 
            });
            
            return (
              <div key={budget.id} className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                        📊
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                        <p className="text-sm text-gray-600">{budget.month}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isOverBudget 
                        ? 'bg-red-100 text-red-700' 
                        : percentage > 80
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {isOverBudget ? 'Over Budget' : percentage > 80 ? 'Warning' : 'On Track'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-600 mb-1">Budget</p>
                        <p className="font-bold text-gray-900">${amount.toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-600 mb-1">Spent</p>
                        <p className="font-bold text-gray-900">${spent.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Remaining</p>
                        <p className={`font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${remaining.toFixed(2)}
                        </p>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div 
                          className={`h-full w-full flex-1 transition-all ${
                            isOverBudget ? 'bg-red-500' : 
                            percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>0%</span>
                        <span className={isOverBudget ? 'text-red-600 font-semibold' : ''}>
                          {percentage.toFixed(1)}%
                        </span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Created {new Date(budget.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : budgets.length > 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No budgets found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            No budgets match your search criteria. Try adjusting your search terms or filters.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No budgets for {selectedMonth}</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create budgets to track your spending and stay on top of your financial goals for this month.
          </p>
          
          {/* Mobile Month Selector */}
          <div className="mb-6 flex justify-center">
            <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
              <label className="text-sm font-medium text-gray-700">Month:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-sm bg-transparent border-none outline-none text-gray-700"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Create Budget for {selectedMonth}
          </button>
        </div>
      )}

      {/* Mobile Floating Action Buttons */}
      <div className="md:hidden fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
        <button
          onClick={handleRefresh}
          className="w-12 h-12 bg-white hover:bg-gray-50 text-gray-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center border border-gray-200"
          title="Refresh budgets"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Budget Modal */}
      {showModal && (
        <BudgetModal
          budget={editingBudget}
          onClose={handleModalClose}
          onSave={handleBudgetSave}
        />
      )}
    </div>
  );
};

export default Budgets;