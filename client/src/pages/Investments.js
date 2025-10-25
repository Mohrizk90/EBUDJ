import React, { useState, useEffect } from 'react';
import { useFinanceContext } from '../contexts/ContextContext';
import { getInvestments, deleteInvestment } from '../services/api';
import InvestmentModal from '../components/InvestmentModal';
import { useNotification } from '../components/NotificationSystem';

const Investments = () => {
  const { currentContext } = useFinanceContext();
  const { success, error: showError } = useNotification();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('asset_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        const data = await getInvestments(currentContext?.id);
        setInvestments(data);
      } catch (err) {
        setError('Failed to load investments');
        console.error('Investments error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, [currentContext?.id]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      try {
        await deleteInvestment(id);
        setInvestments(investments.filter(i => i.id !== id));
        success('Investment deleted successfully!');
      } catch (err) {
        setError('Failed to delete investment');
        showError('Failed to delete investment. Please try again.');
        console.error('Delete error:', err);
      }
    }
  };

  const handleEdit = (investment) => {
    setEditingInvestment(investment);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingInvestment(null);
  };

  const handleInvestmentSave = (savedInvestment) => {
    if (editingInvestment) {
      setInvestments(investments.map(i => 
        i.id === savedInvestment.id ? savedInvestment : i
      ));
      success('Investment updated successfully!');
    } else {
      setInvestments([savedInvestment, ...investments]);
      success('Investment added successfully!');
    }
    handleModalClose();
  };

  // Enhanced filtering and sorting
  const filteredAndSortedInvestments = investments
    .filter(investment => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        investment.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (investment.notes && investment.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Performance filter
      let matchesFilter = true;
      if (filter === 'gains') {
        matchesFilter = (investment.current_value || 0) > (investment.amount_invested || 0);
      } else if (filter === 'losses') {
        matchesFilter = (investment.current_value || 0) < (investment.amount_invested || 0);
      } else if (filter === 'break-even') {
        matchesFilter = Math.abs((investment.current_value || 0) - (investment.amount_invested || 0)) < 0.01;
      }
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'asset_name':
          aValue = a.asset_name.toLowerCase();
          bValue = b.asset_name.toLowerCase();
          break;
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        case 'amount_invested':
          aValue = a.amount_invested || 0;
          bValue = b.amount_invested || 0;
          break;
        case 'current_value':
          aValue = a.current_value || 0;
          bValue = b.current_value || 0;
          break;
        case 'gain_loss':
          aValue = (a.current_value || 0) - (a.amount_invested || 0);
          bValue = (b.current_value || 0) - (b.amount_invested || 0);
          break;
        case 'gain_loss_percentage':
          aValue = (a.amount_invested || 0) > 0 ? ((a.current_value || 0) - (a.amount_invested || 0)) / (a.amount_invested || 0) : 0;
          bValue = (b.amount_invested || 0) > 0 ? ((b.current_value || 0) - (b.amount_invested || 0)) / (b.amount_invested || 0) : 0;
          break;
        case 'date_invested':
          aValue = new Date(a.date_invested || a.created_at);
          bValue = new Date(b.date_invested || b.created_at);
          break;
        default:
          aValue = a.asset_name.toLowerCase();
          bValue = b.asset_name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const totalInvested = investments.reduce((sum, i) => sum + (i.amount_invested || 0), 0);
  const totalValue = investments.reduce((sum, i) => sum + (i.current_value || 0), 0);
  const totalGainLoss = totalValue - totalInvested;
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 border border-blue-200 shadow-soft">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-4xl font-bold gradient-text">Investments</h1>
              <span className="text-3xl floating">📈</span>
            </div>
            <p className="text-lg text-gray-700 max-w-md">
              Track your investment portfolio and monitor performance with real-time insights
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">Live Portfolio</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-xs font-medium text-gray-700">{investments.length} Assets</span>
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
              Add Investment
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card group cursor-pointer hover:scale-105 transition-all duration-300" 
             style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="stat-label">Total Invested</p>
              <p className="stat-value text-blue-600">
                ${totalInvested.toFixed(2)}
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Principal amount</span>
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-blue-500 to-indigo-600 text-white group-hover:scale-110 transition-transform duration-300">
              💰
            </div>
          </div>
          <div className="mt-4 progress">
            <div className="progress-bar bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer hover:scale-105 transition-all duration-300" 
             style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="stat-label">Current Value</p>
              <p className="stat-value text-green-600">
                ${totalValue.toFixed(2)}
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Market value</span>
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-green-500 to-emerald-600 text-white group-hover:scale-110 transition-transform duration-300">
              📈
            </div>
          </div>
          <div className="mt-4 progress">
            <div className="progress-bar bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '85%' }}></div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer hover:scale-105 transition-all duration-300" 
             style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="stat-label">Total Return</p>
              <p className={`stat-value ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toFixed(2)}
              </p>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${totalGainLoss >= 0 ? 'bg-green-500' : 'bg-red-500'} ${totalGainLoss >= 0 ? 'animate-pulse' : ''}`}></div>
                <span className={`text-xs ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercentage.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className={`stat-icon ${
              totalGainLoss >= 0 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                : 'bg-gradient-to-br from-red-500 to-rose-600'
            } text-white group-hover:scale-110 transition-transform duration-300`}>
              {totalGainLoss >= 0 ? '📈' : '📉'}
            </div>
          </div>
          <div className="mt-4 progress">
            <div className={`progress-bar ${
              totalGainLoss >= 0 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-red-500 to-rose-500'
            }`} 
                 style={{ width: `${Math.min(Math.abs(totalGainLossPercentage) * 2, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Controls */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search investments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="asset_name">Asset Name</option>
                <option value="type">Type</option>
                <option value="amount_invested">Amount Invested</option>
                <option value="current_value">Current Value</option>
                <option value="gain_loss">Gain/Loss</option>
                <option value="gain_loss_percentage">Gain/Loss %</option>
                <option value="date_invested">Date Invested</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
              
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                  title="Grid View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                  title="Table View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedInvestments.length} of {investments.length} investments
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: 'all', label: 'All Investments', icon: '📊', count: investments.length },
          { key: 'gains', label: 'Gains', icon: '📈', count: investments.filter(i => (i.current_value || 0) > (i.amount_invested || 0)).length },
          { key: 'losses', label: 'Losses', icon: '📉', count: investments.filter(i => (i.current_value || 0) < (i.amount_invested || 0)).length },
          { key: 'break-even', label: 'Break Even', icon: '⚖️', count: investments.filter(i => Math.abs((i.current_value || 0) - (i.amount_invested || 0)) < 0.01).length }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`group flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
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

      {/* Investments Display */}
      {filteredAndSortedInvestments.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedInvestments.map((investment, index) => {
            const currentValue = investment.current_value || 0;
            const investedAmount = investment.amount_invested || 0;
            const gainLoss = currentValue - investedAmount;
            const gainLossPercentage = investedAmount > 0 ? (gainLoss / investedAmount) * 100 : 0;
            const isPositive = gainLoss >= 0;
            
            return (
              <div key={investment.id} 
                   className="stat-card group cursor-pointer hover:scale-105 transition-all duration-300 animate-fade-in" 
                   style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="stat-icon bg-gradient-to-br from-blue-500 to-purple-600 text-white group-hover:scale-110 transition-transform duration-300">
                        📈
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-200">{investment.asset_name}</h3>
                        <p className="text-sm text-gray-600">{investment.type}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                      isPositive 
                        ? 'bg-green-100 text-green-700 group-hover:bg-green-200' 
                        : 'bg-red-100 text-red-700 group-hover:bg-red-200'
                    }`}>
                      {isPositive ? '↗ Gain' : '↘ Loss'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 group-hover:from-blue-50 group-hover:to-blue-100 transition-all duration-300">
                        <p className="text-xs text-gray-600 mb-1">Invested</p>
                        <p className="font-bold text-gray-900">${investedAmount.toFixed(2)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 group-hover:from-green-50 group-hover:to-green-100 transition-all duration-300">
                        <p className="text-xs text-gray-600 mb-1">Current Value</p>
                        <p className="font-bold text-gray-900">${currentValue.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 group-hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Return</p>
                        <p className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}${gainLoss.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Percentage</p>
                        <p className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{gainLossPercentage.toFixed(2)}%
                        </p>
                      </div>
                      <div className="mt-3 progress">
                        <div className={`progress-bar ${
                          isPositive 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-r from-red-500 to-rose-500'
                        }`} 
                             style={{ width: `${Math.min(Math.abs(gainLossPercentage) * 2, 100)}%` }}></div>
                      </div>
                    </div>

                    {investment.notes && (
                      <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 group-hover:shadow-sm transition-all duration-300">
                        <span className="text-sm text-gray-600">Notes</span>
                        <span className="font-medium text-blue-600 max-w-32 truncate">{investment.notes}</span>
                      </div>
                    )}

                    {investment.date_invested && (
                      <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 group-hover:shadow-sm transition-all duration-300">
                        <span className="text-sm text-gray-600">Date Invested</span>
                        <span className="font-medium text-purple-600">{new Date(investment.date_invested).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(investment)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 group"
                        title="Edit investment"
                      >
                        <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(investment.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 group"
                        title="Delete investment"
                      >
                        <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Added {new Date(investment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Invested</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Return %</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedInvestments.map((investment, index) => {
                    const currentValue = investment.current_value || 0;
                    const investedAmount = investment.amount_invested || 0;
                    const gainLoss = currentValue - investedAmount;
                    const gainLossPercentage = investedAmount > 0 ? (gainLoss / investedAmount) * 100 : 0;
                    const isPositive = gainLoss >= 0;
                    
                    return (
                      <tr key={investment.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm mr-3">
                              📈
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{investment.asset_name}</div>
                              {investment.notes && (
                                <div className="text-xs text-gray-500 truncate max-w-32">{investment.notes}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {investment.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          ${investedAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          ${currentValue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}${gainLoss.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{gainLossPercentage.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(investment)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Edit investment"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(investment.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Delete investment"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-20 animate-fade-in">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8 floating">
              <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-3xl font-bold gradient-text mb-4">
            {searchTerm || filter !== 'all' ? 'No investments found' : 'No investments yet'}
          </h3>
          <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
              : 'Start building your investment portfolio and track your financial growth over time with our comprehensive tools.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {searchTerm || filter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                className="btn btn-outline"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Clear Filters
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn btn-primary shadow-glow hover:shadow-lg group"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Your First Investment
                </button>
                <button className="btn btn-outline">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Learn More
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <button
          onClick={() => setShowModal(true)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        >
          <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Investment Modal */}
      {showModal && (
        <InvestmentModal
          investment={editingInvestment}
          onClose={handleModalClose}
          onSave={handleInvestmentSave}
        />
      )}
    </div>
  );
};

export default Investments;