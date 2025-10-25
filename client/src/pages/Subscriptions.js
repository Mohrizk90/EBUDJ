import React, { useState, useEffect } from 'react';
import { useFinanceContext } from '../contexts/ContextContext';
import { getSubscriptions, deleteSubscription } from '../services/api';
import SubscriptionModal from '../components/SubscriptionModal';
import { useNotification } from '../components/NotificationSystem';

const Subscriptions = () => {
  const { currentContext } = useFinanceContext();
  const { success, error: showError } = useNotification();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('next_billing_date');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const data = await getSubscriptions(currentContext?.id);
        setSubscriptions(data);
      } catch (err) {
        setError('Failed to load subscriptions');
        console.error('Subscriptions error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [currentContext?.id]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await deleteSubscription(id);
        setSubscriptions(subscriptions.filter(s => s.id !== id));
        success('Subscription deleted successfully!');
      } catch (err) {
        setError('Failed to delete subscription');
        showError('Failed to delete subscription. Please try again.');
        console.error('Delete error:', err);
      }
    }
  };

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingSubscription(null);
  };

  const handleSubscriptionSave = (savedSubscription) => {
    if (editingSubscription) {
      setSubscriptions(subscriptions.map(s => 
        s.id === savedSubscription.id ? savedSubscription : s
      ));
      success('Subscription updated successfully!');
    } else {
      setSubscriptions([savedSubscription, ...subscriptions]);
      success('Subscription created successfully!');
    }
    handleModalClose();
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && subscription.status === 'Active') ||
      (filter === 'paused' && subscription.status === 'Paused') ||
      (filter === 'cancelled' && subscription.status === 'Cancelled');
    
    const matchesSearch = subscription.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.frequency?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'amount':
        aValue = a.amount || 0;
        bValue = b.amount || 0;
        break;
      case 'service':
        aValue = a.service?.toLowerCase() || '';
        bValue = b.service?.toLowerCase() || '';
        break;
      case 'frequency':
        aValue = a.frequency?.toLowerCase() || '';
        bValue = b.frequency?.toLowerCase() || '';
        break;
      case 'next_billing_date':
      default:
        aValue = new Date(a.next_billing_date);
        bValue = new Date(b.next_billing_date);
        break;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalMonthlyCost = subscriptions
    .filter(s => s.status === 'Active')
    .reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalYearlyCost = totalMonthlyCost * 12;

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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-8 border border-orange-200 shadow-soft">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-400/20 to-pink-400/20 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-4xl font-bold gradient-text">Subscriptions</h1>
              <span className="text-3xl floating">🔄</span>
            </div>
            <p className="text-lg text-gray-700 max-w-md">
              Manage your recurring subscriptions and bills with smart tracking
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">Active Tracking</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-xs font-medium text-gray-700">{subscriptions.length} Subscriptions</span>
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
              Add Subscription
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
              <p className="stat-label">Monthly Cost</p>
              <p className="stat-value text-red-600">
                ${totalMonthlyCost.toFixed(2)}
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Recurring expenses</span>
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-red-500 to-rose-600 text-white group-hover:scale-110 transition-transform duration-300">
              💳
            </div>
          </div>
          <div className="mt-4 progress">
            <div className="progress-bar progress-danger" style={{ width: '75%' }}></div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer hover:scale-105 transition-all duration-300 animate-fade-in" 
             style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="stat-label">Yearly Cost</p>
              <p className="stat-value text-blue-600">
                ${totalYearlyCost.toFixed(2)}
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Annual projection</span>
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-blue-500 to-indigo-600 text-white group-hover:scale-110 transition-transform duration-300">
              📅
            </div>
          </div>
          <div className="mt-4 progress">
            <div className="progress-bar bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: '90%' }}></div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer hover:scale-105 transition-all duration-300 animate-fade-in" 
             style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="stat-label">Active Subscriptions</p>
              <p className="stat-value text-green-600">
                {subscriptions.filter(s => s.status === 'Active').length}
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">{subscriptions.length} total</span>
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-green-500 to-emerald-600 text-white group-hover:scale-110 transition-transform duration-300">
              🔄
            </div>
          </div>
          <div className="mt-4 progress">
            <div className="progress-bar progress-success" style={{ width: `${Math.min((subscriptions.filter(s => s.status === 'Active').length / Math.max(subscriptions.length, 1)) * 100, 100)}%` }}></div>
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
                  placeholder="Search subscriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 hover:border-orange-400 focus:border-orange-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Enhanced Filter Buttons */}
            <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Subscriptions', icon: '📊', count: subscriptions.length },
          { key: 'active', label: 'Active', icon: '✅', count: subscriptions.filter(s => s.status === 'Active').length },
          { key: 'paused', label: 'Paused', icon: '⏸️', count: subscriptions.filter(s => s.status === 'Paused').length },
          { key: 'cancelled', label: 'Cancelled', icon: '❌', count: subscriptions.filter(s => s.status === 'Cancelled').length }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`group flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
              filter === filterOption.key 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
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
          
          {/* Sorting Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              >
                <option value="next_billing_date">Next Billing</option>
                <option value="amount">Amount</option>
                <option value="service">Service</option>
                <option value="frequency">Frequency</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Order:</span>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              >
                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                <span className="text-sm">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Grid */}
      {filteredSubscriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSubscriptions.map((subscription, index) => {
            const isActive = subscription.status === 'Active';
            const isPaused = subscription.status === 'Paused';
            const isCancelled = subscription.status === 'Cancelled';
            const nextBilling = subscription.next_billing_date ? new Date(subscription.next_billing_date) : null;
            const daysUntilBilling = nextBilling ? Math.ceil((nextBilling - new Date()) / (1000 * 60 * 60 * 24)) : null;
            
            return (
              <div key={subscription.id} 
                   className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                   style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg ${
                        isActive 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                          : isPaused
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                          : isCancelled
                          ? 'bg-gradient-to-br from-red-500 to-rose-600'
                          : 'bg-gradient-to-br from-gray-500 to-gray-600'
                      }`}>
                        {isActive ? '🔄' : isPaused ? '⏸️' : isCancelled ? '❌' : '📋'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{subscription.service}</h3>
                        <p className="text-sm text-gray-600 capitalize">{subscription.frequency}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isActive 
                        ? 'bg-green-100 text-green-700' 
                        : isPaused
                        ? 'bg-yellow-100 text-yellow-700'
                        : isCancelled
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {subscription.status}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-bold text-gray-900">${(subscription.amount || 0).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Frequency</p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                          {subscription.frequency || 'monthly'}
                        </p>
                      </div>
                    </div>

                    {nextBilling && isActive && (
                      <div className={`rounded-xl p-4 ${
                        daysUntilBilling <= 3 ? 'bg-red-50 border border-red-200' : 
                        daysUntilBilling <= 7 ? 'bg-yellow-50 border border-yellow-200' : 
                        'bg-blue-50 border border-blue-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Next Billing</p>
                          <p className={`font-bold ${
                            daysUntilBilling <= 3 ? 'text-red-600' : 
                            daysUntilBilling <= 7 ? 'text-yellow-600' : 'text-blue-600'
                          }`}>
                            {nextBilling.toLocaleDateString()}
                          </p>
                        </div>
                        {daysUntilBilling !== null && (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">Days until billing</p>
                            <p className={`text-sm font-semibold ${
                              daysUntilBilling <= 3 ? 'text-red-600' : 
                              daysUntilBilling <= 7 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {daysUntilBilling <= 0 ? 'Overdue' : `${daysUntilBilling} days`}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {subscription.description && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Description</p>
                        <p className="text-sm text-gray-900">{subscription.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(subscription)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 group"
                        title="Edit subscription"
                      >
                        <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(subscription.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 group"
                        title="Delete subscription"
                      >
                        <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Added {new Date(subscription.created_at).toLocaleDateString()}
                      </p>
                      {subscription.created_at && (
                        <p className="text-xs text-gray-400">
                          {new Date(subscription.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 animate-fade-in">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-8 floating">
              <svg className="w-16 h-16 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-3xl font-bold gradient-text mb-4">No subscriptions found</h3>
          <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
              : 'Start tracking your recurring subscriptions and bills to better manage your monthly expenses and take control of your finances.'
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
              Add Your First Subscription
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

      {/* Subscription Modal */}
      {showModal && (
        <SubscriptionModal
          subscription={editingSubscription}
          onClose={handleModalClose}
          onSave={handleSubscriptionSave}
        />
      )}
    </div>
  );
};

export default Subscriptions;