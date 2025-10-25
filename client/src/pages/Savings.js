import React, { useState, useEffect } from 'react';
import { useFinanceContext } from '../contexts/ContextContext';
import { getSavings, deleteSaving } from '../services/api';
import SavingsModal from '../components/SavingsModal';
import { useNotification } from '../components/NotificationSystem';

const Savings = () => {
  const { currentContext } = useFinanceContext();
  const { success, error: showError } = useNotification();
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSavings, setEditingSavings] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSavings = async () => {
      if (currentContext?.id) {
        try {
          setLoading(true);
          const data = await getSavings(currentContext.id);
          setSavingsGoals(data);
        } catch (err) {
          setError('Failed to load savings goals');
          console.error('Savings error:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSavings();
  }, [currentContext?.id]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        await deleteSaving(id);
        setSavingsGoals(savingsGoals.filter(s => s.id !== id));
        success('Savings goal deleted successfully!');
      } catch (err) {
        setError('Failed to delete savings goal');
        showError('Failed to delete savings goal. Please try again.');
        console.error('Delete error:', err);
      }
    }
  };

  const handleEdit = (savings) => {
    setEditingSavings(savings);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingSavings(null);
  };

  const handleSavingsSave = (savedSavings) => {
    if (editingSavings) {
      setSavingsGoals(savingsGoals.map(s => 
        s.id === savedSavings.id ? savedSavings : s
      ));
      success('Savings goal updated successfully!');
    } else {
      setSavingsGoals([savedSavings, ...savingsGoals]);
      success('Savings goal created successfully!');
    }
    handleModalClose();
  };

  // Calculate progress for each savings goal
  const enhancedSavingsGoals = savingsGoals.map(goal => {
    const progress = Math.min((goal.amount / goal.goal) * 100, 100);
    return {
      ...goal,
      progress
    };
  });

  const filteredSavingsGoals = enhancedSavingsGoals.filter(goal => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && goal.progress < 100) ||
      (filter === 'completed' && goal.progress >= 100);
    
    const matchesSearch = goal.account?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const totalGoals = savingsGoals.length;
  const completedGoals = enhancedSavingsGoals.filter(g => g.progress >= 100).length;
  const totalTargetAmount = enhancedSavingsGoals.reduce((sum, g) => sum + g.goal, 0);
  const totalCurrentAmount = enhancedSavingsGoals.reduce((sum, g) => sum + g.amount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton-text w-32 h-8 mb-2"></div>
            <div className="skeleton-text w-48 h-4"></div>
          </div>
          <div className="skeleton-text w-32 h-10"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="stat-card animate-pulse">
              <div className="skeleton-text w-24 h-4 mb-2"></div>
              <div className="skeleton-text w-16 h-8 mb-4"></div>
              <div className="skeleton-text w-32 h-2"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="skeleton-text w-32 h-6 mb-4"></div>
              <div className="skeleton-text w-24 h-4 mb-2"></div>
              <div className="skeleton-text w-16 h-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8 border border-green-200 shadow-soft">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-4xl font-bold gradient-text">Savings Goals</h1>
              <span className="text-3xl floating">💰</span>
            </div>
            <p className="text-lg text-gray-700 max-w-md">
              Track your financial goals and watch your progress grow
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">Auto Transactions</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-xs font-medium text-gray-700">{totalGoals} Goals</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary shadow-glow hover:shadow-lg group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Savings Goal
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card group cursor-pointer hover:scale-105 transition-all duration-300 animate-fade-in" 
             style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="stat-label">Total Progress</p>
              <p className="stat-value text-green-600">
                {overallProgress.toFixed(1)}%
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">${totalCurrentAmount.toFixed(2)} / ${totalTargetAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-green-500 to-emerald-600 text-white group-hover:scale-110 transition-transform duration-300">
              📊
            </div>
          </div>
          <div className="mt-4 progress">
            <div className="progress-bar progress-success" style={{ width: `${Math.min(overallProgress, 100)}%` }}></div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer hover:scale-105 transition-all duration-300 animate-fade-in" 
             style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="stat-label">Goals Completed</p>
              <p className="stat-value text-blue-600">
                {completedGoals}
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">{totalGoals} total goals</span>
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-blue-500 to-indigo-600 text-white group-hover:scale-110 transition-transform duration-300">
              🎯
            </div>
          </div>
          <div className="mt-4 progress">
            <div className="progress-bar bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0}%` }}></div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer hover:scale-105 transition-all duration-300 animate-fade-in" 
             style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="stat-label">Active Goals</p>
              <p className="stat-value text-orange-600">
                {totalGoals - completedGoals}
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">In progress</span>
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-orange-500 to-red-600 text-white group-hover:scale-110 transition-transform duration-300">
              🚀
            </div>
          </div>
          <div className="mt-4 progress">
            <div className="progress-bar bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${totalGoals > 0 ? ((totalGoals - completedGoals) / totalGoals) * 100 : 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="card animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Enhanced Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search savings goals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 hover:border-green-400 focus:border-green-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Enhanced Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Goals', icon: '📊', count: totalGoals },
                { key: 'active', label: 'Active', icon: '🚀', count: totalGoals - completedGoals },
                { key: 'completed', label: 'Completed', icon: '🎯', count: completedGoals }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                    filter === filterOption.key 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25' 
                      : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <span className="group-hover:scale-110 transition-transform duration-200">{filterOption.icon}</span>
                  <span>{filterOption.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    filter === filterOption.key 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {filterOption.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Savings Goals Grid */}
      {filteredSavingsGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSavingsGoals.map((goal, index) => (
            <div key={goal.id} 
                 className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                 style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg ${
                      goal.progress >= 100 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : goal.progress >= 75
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        : goal.progress >= 50
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                        : 'bg-gradient-to-br from-red-500 to-rose-600'
                    }`}>
                      {goal.progress >= 100 ? '🎯' : goal.progress >= 75 ? '🚀' : goal.progress >= 50 ? '📈' : '💰'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{goal.account}</h3>
                      <p className="text-sm text-gray-600">{goal.progress.toFixed(1)}% complete</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    goal.progress >= 100 
                      ? 'bg-green-100 text-green-700' 
                      : goal.progress >= 75
                      ? 'bg-blue-100 text-blue-700'
                      : goal.progress >= 50
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {goal.progress >= 100 ? 'Completed' : goal.progress >= 75 ? 'Almost There' : goal.progress >= 50 ? 'Halfway' : 'Getting Started'}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-gray-900">
                        ${goal.amount.toFixed(2)} / ${goal.goal.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          goal.progress >= 100 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : goal.progress >= 75
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                            : goal.progress >= 50
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-r from-red-500 to-rose-500'
                        }`}
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Auto Transaction Info */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">🔄</span>
                      <p className="text-sm text-blue-800 font-medium">Auto Transactions</p>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Amount changes automatically create transactions
                    </p>
                  </div>

                  {/* Target Date */}
                  {goal.date && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Target Date</p>
                        <p className="font-bold text-gray-900">
                          {new Date(goal.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {goal.description && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="text-sm text-gray-900">{goal.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 group"
                      title="Edit savings goal"
                    >
                      <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 group"
                      title="Delete savings goal"
                    >
                      <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Created {new Date(goal.created_at).toLocaleDateString()}
                    </p>
                    {goal.created_at && (
                      <p className="text-xs text-gray-400">
                        {new Date(goal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 animate-fade-in">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 floating">
              <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-3xl font-bold gradient-text mb-4">No savings goals found</h3>
          <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
              : 'Start setting financial goals and track your progress toward achieving them. Every journey begins with a single step!'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary shadow-glow hover:shadow-lg group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Goal
            </button>
            {(searchTerm || filter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                className="btn btn-outline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Savings Modal */}
      {showModal && (
        <SavingsModal
          savings={editingSavings}
          onClose={handleModalClose}
          onSave={handleSavingsSave}
        />
      )}
    </div>
  );
};

export default Savings;