import React, { useState } from 'react';
import { useFinanceContext } from '../contexts/ContextContext';

const ExportImportModal = ({ isOpen, onClose }) => {
  const { currentContext } = useFinanceContext();
  const [activeTab, setActiveTab] = useState('export');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    if (!currentContext) {
      setMessage('Please select a context first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/export?context_id=${currentContext.id}`);
      if (!response.ok) throw new Error('Export failed');
      
      const data = await response.json();
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentContext.name}-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage('Export completed successfully!');
    } catch (error) {
      setMessage(`Export failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!currentContext) {
      setMessage('Please select a context first');
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const response = await fetch('/api/export/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context_id: currentContext.id,
          data: data.data
        })
      });
      
      if (!response.ok) throw new Error('Import failed');
      
      const result = await response.json();
      setMessage(`Import completed! ${JSON.stringify(result.results.imported)}`);
    } catch (error) {
      setMessage(`Import failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/export/backup');
      if (!response.ok) throw new Error('Backup failed');
      
      const result = await response.json();
      setMessage(`Backup created: ${result.backupFile}`);
    } catch (error) {
      setMessage(`Backup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Export & Import Data
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('export')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'export'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Export
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'import'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Import
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'backup'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Backup
            </button>
          </div>

          {/* Content */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Export all data for the current context to a JSON file.
              </p>
              <button
                onClick={handleExport}
                disabled={loading || !currentContext}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Exporting...' : 'Export Data'}
              </button>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Import data from a previously exported JSON file.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={loading || !currentContext}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Create a full database backup.
              </p>
              <button
                onClick={handleBackup}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Backup...' : 'Create Backup'}
              </button>
            </div>
          )}

          {message && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportImportModal;
