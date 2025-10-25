import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFinanceContext } from '../contexts/ContextContext';
import { NAVIGATION_ITEMS } from '../config/routes';
import ContextSelector from './ContextSelector';
import ThemeToggle from './ThemeToggle';
import ExportImportModal from './ExportImportModal';

const Layout = ({ children }) => {
  const { currentContext } = useFinanceContext();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);

  const navigation = NAVIGATION_ITEMS;

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 border-r border-gray-200 bg-white/95 backdrop-blur-md transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-lg lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <div className="sidebar-header flex h-20 items-center px-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3 flex-1">
              <div className="stat-icon bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                💰
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">Finance Tracker</h1>
                <p className="text-xs text-gray-600">Personal Finance Hub</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all duration-200 hover:scale-110"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Context Selector */}
          <div className="p-4 border-b border-gray-200">
            <ContextSelector />
          </div>

          {/* Enhanced Navigation */}
          <div className="flex-1 overflow-auto py-6">
            <nav className="space-y-2 px-4">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`nav-item group ${isActive(item.href) ? 'active' : ''} animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="nav-item-icon group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                  {isActive(item.href) && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Enhanced Footer */}
          <div className="border-t border-gray-200/50 p-4 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">
                <p className="font-medium">Finance Tracker</p>
                <p>v2.0.0</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Enhanced Top bar */}
        <header className="top-bar flex h-16 items-center px-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentContext ? currentContext.name : 'Finance Tracker'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentContext ? `${currentContext.type} Dashboard` : 'Welcome to Your Finance Hub'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowExportImport(true)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200"
                title="Export/Import Data"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </button>
              <ThemeToggle />
              <div className="px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                {currentContext ? currentContext.type : 'Home'}
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600 font-medium">Live</span>
              </div>
            </div>
          </div>
        </header>

               {/* Enhanced Page content */}
               <main className="main-content">
                 <div className="max-w-7xl mx-auto">
                   {children}
                 </div>
               </main>
      </div>

      {/* Export/Import Modal */}
      <ExportImportModal 
        isOpen={showExportImport} 
        onClose={() => setShowExportImport(false)} 
      />
    </div>
  );
};

export default Layout;