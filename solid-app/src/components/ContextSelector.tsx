import { For, Show, createSignal } from 'solid-js';
import { contextStore, contextActions } from '../stores/context';
import Modal from './ui/Modal';
import Button from './ui/Button';
import ConfirmDialog from './ui/ConfirmDialog';
import { showToast } from '../lib/toast';
import type { Context } from '../lib/types';
import { FiEdit2, FiTrash2, FiMoreVertical } from 'solid-icons/fi';

export default function ContextSelector() {
  const [showModal, setShowModal] = createSignal(false);
  const [showCreateModal, setShowCreateModal] = createSignal(false);
  const [showEditModal, setShowEditModal] = createSignal(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  const [editingContext, setEditingContext] = createSignal<Context | null>(null);
  const [contextToDelete, setContextToDelete] = createSignal<Context | null>(null);
  const [newContextName, setNewContextName] = createSignal('');
  const [newContextType, setNewContextType] = createSignal<Context['type']>('Home');

  const handleSwitchContext = (context: Context) => {
    contextActions.switchContext(context);
    showToast.success(`Switched to ${context.name}`);
    setShowModal(false);
  };

  const handleCreateContext = async (e: Event) => {
    e.preventDefault();
    try {
      const newContext = await contextActions.createContext(newContextName(), newContextType());
      showToast.success(`Context "${newContextName()}" created successfully`);
      setNewContextName('');
      setShowCreateModal(false);
      if (newContext) {
        contextActions.switchContext(newContext);
      }
    } catch (error: any) {
      showToast.error(error?.message || 'Failed to create context');
      console.error('Failed to create context:', error);
    }
  };

  const openEditModal = (context: Context, e: Event) => {
    e.stopPropagation();
    setEditingContext(context);
    setNewContextName(context.name);
    setNewContextType(context.type);
    setShowModal(false);
    setShowEditModal(true);
  };

  const handleEditContext = async (e: Event) => {
    e.preventDefault();
    const context = editingContext();
    if (!context) return;

    try {
      await contextActions.updateContext(context.id, newContextName(), newContextType());
      showToast.success(`Context "${newContextName()}" updated successfully`);
      setNewContextName('');
      setEditingContext(null);
      setShowEditModal(false);
    } catch (error: any) {
      showToast.error(error?.message || 'Failed to update context');
      console.error('Failed to update context:', error);
    }
  };

  const confirmDeleteContext = (context: Context, e: Event) => {
    e.stopPropagation();
    setContextToDelete(context);
    setShowModal(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteContext = async () => {
    const context = contextToDelete();
    if (!context) return;

    try {
      await contextActions.deleteContext(context.id);
      showToast.success(`Context "${context.name}" deleted successfully`);
      setContextToDelete(null);
    } catch (error: any) {
      showToast.error(error?.message || 'Failed to delete context');
      console.error('Failed to delete context:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
      >
        <span class="text-sm font-medium text-gray-900 dark:text-white">
          {contextStore.currentContext?.name || 'Select Context'}
        </span>
        <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
          {contextStore.currentContext?.type}
        </span>
      </button>

      {/* Context Selection Modal */}
      <Modal
        isOpen={showModal()}
        onClose={() => setShowModal(false)}
        title="Select Context"
      >
        <div class="space-y-2">
          <For each={contextStore.contexts}>
            {(context) => (
              <div
                class={`relative w-full px-4 py-3 rounded-lg transition-colors ${
                  contextStore.currentContext?.id === context.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <button
                  onClick={() => handleSwitchContext(context)}
                  class="w-full text-left"
                >
                  <div class="font-medium text-gray-900 dark:text-white pr-16">
                    {context.name}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {context.type}
                  </div>
                </button>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    onClick={(e) => openEditModal(context, e)}
                    class="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Edit context"
                  >
                    <FiEdit2 class="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={(e) => confirmDeleteContext(context, e)}
                    class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    title="Delete context"
                    disabled={contextStore.contexts.length === 1}
                  >
                    <FiTrash2 class={`w-4 h-4 ${
                      contextStore.contexts.length === 1
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'text-red-600 dark:text-red-400'
                    }`} />
                  </button>
                </div>
              </div>
            )}
          </For>
          
          <Button
            onClick={() => {
              setShowModal(false);
              setShowCreateModal(true);
            }}
            variant="secondary"
            class="w-full mt-4"
          >
            Create New Context
          </Button>
        </div>
      </Modal>

      {/* Create Context Modal */}
      <Modal
        isOpen={showCreateModal()}
        onClose={() => setShowCreateModal(false)}
        title="Create New Context"
      >
        <form onSubmit={handleCreateContext} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={newContextName()}
              onInput={(e) => setNewContextName(e.currentTarget.value)}
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Personal, Work"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type *
            </label>
            <select
              value={newContextType()}
              onChange={(e) => setNewContextType(e.currentTarget.value as Context['type'])}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Business">Business</option>
            </select>
          </div>
          
          <div class="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Context Modal */}
      <Modal
        isOpen={showEditModal()}
        onClose={() => {
          setShowEditModal(false);
          setEditingContext(null);
          setNewContextName('');
        }}
        title="Edit Context"
      >
        <form onSubmit={handleEditContext} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={newContextName()}
              onInput={(e) => setNewContextName(e.currentTarget.value)}
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Personal, Work"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type *
            </label>
            <select
              value={newContextType()}
              onChange={(e) => setNewContextType(e.currentTarget.value as Context['type'])}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Business">Business</option>
            </select>
          </div>
          
          <div class="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowEditModal(false);
                setEditingContext(null);
                setNewContextName('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm()}
        onClose={() => {
          setShowDeleteConfirm(false);
          setContextToDelete(null);
        }}
        onConfirm={handleDeleteContext}
        title="Delete Context"
        message={`Are you sure you want to delete "${contextToDelete()?.name}"? All associated data (transactions, budgets, etc.) will remain but will need to be accessed from another context.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
