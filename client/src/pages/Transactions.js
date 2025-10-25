import React, { useState, useEffect } from 'react';
import { useFinanceContext } from '../contexts/ContextContext';
import { getTransactions, deleteTransaction } from '../services/api';
import TransactionModal from '../components/TransactionModal';
import { useNotification } from '../components/NotificationSystem';
import { StatCardSkeleton, TableSkeleton } from '../components/LoadingSkeleton';

const Transactions = () => {
  const { currentContext } = useFinanceContext();
  const { success, error: showError } = useNotification();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getTransactions(currentContext?.id);
        setTransactions(data);
      } catch (err) {
        setError('Failed to load transactions');
        console.error('Transactions error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentContext?.id]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
        setTransactions(transactions.filter(t => t.id !== id));
        success('Transaction deleted successfully!');
      } catch (err) {
        setError('Failed to delete transaction');
        showError('Failed to delete transaction. Please try again.');
        console.error('Delete error:', err);
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  const handleTransactionSave = (savedTransaction) => {
    if (editingTransaction) {
      setTransactions(transactions.map(t => 
        t.id === savedTransaction.id ? savedTransaction : t
      ));
    } else {
      setTransactions([savedTransaction, ...transactions]);
    }
    handleModalClose();
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || 
      (filter === 'income' && transaction.type === 'Income') ||
      (filter === 'expense' && transaction.type === 'Expense');
    
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'amount':
        aValue = a.amount || 0;
        bValue = b.amount || 0;
        break;
      case 'description':
        aValue = a.description?.toLowerCase() || '';
        bValue = b.description?.toLowerCase() || '';
        break;
      case 'category':
        aValue = a.category?.toLowerCase() || '';
        bValue = b.category?.toLowerCase() || '';
        break;
      case 'date':
      default:
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

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
        <StatCardSkeleton count={3} />
        <TableSkeleton rows={8} columns={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-8 border border-green-200 shadow-soft">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-4xl font-bold gradient-text">Transactions</h1>
              <span className="text-3xl floating">💳</span>
            </div>
            <p className="text-lg text-gray-700 max-w-md">
              Manage your income and expenses with detailed tracking and insights
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">Live Tracking</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-xs font-medium text-gray-700">{transactions.length} Transactions</span>
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
              Add Transaction
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
              <p className="stat-label">Total Income</p>
              <p className="stat-value text-green-600">
                ${totalIncome.toFixed(2)}
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">{transactions.filter(t => t.type === 'Income').length} transactions</span>
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-green-500 to-emerald-600 text-white group-hover:scale-110 transition-transform duration-300">
              📈
            </div>
          </div>
          <div className="mt-4 progress">
            <div className="progress-bar progress-success" style={{ width: `${Math.min((totalIncome / (totalIncome + totalExpenses)) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer hover:scale-105 transition-all duration-300 animate-fade-in" 
             style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="stat-label">Total Expenses</p>
              <p className="stat-value text-red-600">
                ${totalExpenses.toFixed(2)}
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-500">{transactions.filter(t => t.type === 'Expense').length} transactions</span>
              </div>
            </div>
            <div className="stat-icon bg-gradient-to-br from-red-500 to-rose-600 text-white group-hover:scale-110 transition-transform duration-300">
              📉
            </div>
          </div>
          <div className="mt-4 progress">
            <div className="progress-bar progress-danger" style={{ width: `${Math.min((totalExpenses / (totalIncome + totalExpenses)) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer hover:scale-105 transition-all duration-300 animate-fade-in" 
             style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="stat-label">Net Balance</p>
              <p className={`stat-value ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(totalIncome - totalExpenses).toFixed(2)}
              </p>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${totalIncome - totalExpenses >= 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-500">
                  {totalIncome - totalExpenses >= 0 ? 'Positive' : 'Negative'} cash flow
                </span>
              </div>
            </div>
            <div className={`stat-icon ${
              totalIncome - totalExpenses >= 0 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                : 'bg-gradient-to-br from-red-500 to-rose-600'
            } text-white group-hover:scale-110 transition-transform duration-300`}>
              {totalIncome - totalExpenses >= 0 ? '💚' : '💔'}
            </div>
          </div>
          <div className="mt-4 progress">
            <div className={`progress-bar ${totalIncome - totalExpenses >= 0 ? 'progress-success' : 'progress-danger'}`} 
                 style={{ width: `${Math.min(Math.abs(totalIncome - totalExpenses) / Math.max(totalIncome, totalExpenses) * 100, 100)}%` }}></div>
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
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 hover:border-blue-400 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Enhanced Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', icon: '📊', count: transactions.length },
                { key: 'income', label: 'Income', icon: '📈', count: transactions.filter(t => t.type === 'Income').length },
                { key: 'expense', label: 'Expenses', icon: '📉', count: transactions.filter(t => t.type === 'Expense').length }
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="description">Description</option>
                <option value="category">Category</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Order:</span>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                <span className="text-sm">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Transactions Table */}
      <div className="card animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                📋
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                <p className="text-sm text-gray-600">
                  {filteredTransactions.length} of {transactions.length} transactions
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-0">
          {filteredTransactions.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table">
                <thead className="table-header">
                  <tr className="table-row">
                    <th className="table-head">
                      <button
                        onClick={() => {
                          setSortBy('description');
                          setSortOrder(sortBy === 'description' && sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200"
                      >
                        <span>Description</span>
                        {sortBy === 'description' && (
                          <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="table-head">
                      <button
                        onClick={() => {
                          setSortBy('category');
                          setSortOrder(sortBy === 'category' && sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200"
                      >
                        <span>Category</span>
                        {sortBy === 'category' && (
                          <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="table-head">Type</th>
                    <th className="table-head">Account</th>
                    <th className="table-head">
                      <button
                        onClick={() => {
                          setSortBy('amount');
                          setSortOrder(sortBy === 'amount' && sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200"
                      >
                        <span>Amount</span>
                        {sortBy === 'amount' && (
                          <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="table-head">
                      <button
                        onClick={() => {
                          setSortBy('date');
                          setSortOrder(sortBy === 'date' && sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200"
                      >
                        <span>Date</span>
                        {sortBy === 'date' && (
                          <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="table-head">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <tr key={transaction.id || index} 
                        className="table-row group hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 animate-fade-in"
                        style={{ animationDelay: `${0.6 + index * 0.05}s` }}>
                      <td className="table-cell">
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
                            {transaction.notes && (
                              <p className="text-sm text-gray-600">{transaction.notes}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="badge badge-outline hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200">{transaction.category}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge transition-all duration-200 hover:scale-105 ${
                          transaction.type === 'Income' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}>
                          {transaction.type === 'Income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="badge badge-outline hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200">
                          {transaction.account}
                        </span>
                      </td>
                      <td className="table-cell">
                        <p className={`font-semibold text-lg ${
                          transaction.type === 'Income' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'Income' ? '+' : '-'}${transaction.amount?.toFixed(2)}
                        </p>
                      </td>
                      <td className="table-cell">
                        <div className="flex flex-col">
                          <p className="text-sm text-gray-900 font-medium">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                          {transaction.date.includes('T') && transaction.date.includes(':') && (
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 group"
                            title="Edit transaction"
                          >
                            <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 group"
                            title="Delete transaction"
                          >
                            <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {filteredTransactions.map((transaction, index) => (
                  <div key={transaction.id || index} 
                       className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in"
                       style={{ animationDelay: `${0.6 + index * 0.05}s` }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg shadow-lg ${
                          transaction.type === 'Income' 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                            : 'bg-gradient-to-br from-red-500 to-rose-600'
                        }`}>
                          {transaction.type === 'Income' ? '📈' : '📉'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
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
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`badge text-xs ${
                          transaction.type === 'Income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'Income' ? 'Income' : 'Expense'}
                        </span>
                        <span className="badge badge-outline text-xs">
                          {transaction.account}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit transaction"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete transaction"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8 floating">
                  <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-3xl font-bold gradient-text mb-4">No transactions found</h3>
              <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                  : 'Start tracking your finances by adding your first transaction and take control of your money.'
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
                  Add Your First Transaction
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
        </div>
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={handleModalClose}
          onSave={handleTransactionSave}
        />
      )}
    </div>
  );
};

export default Transactions;