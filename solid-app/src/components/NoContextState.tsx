import { createSignal } from 'solid-js';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { contextActions } from '../stores/context';
import { showToast } from '../lib/toast';
import type { Context } from '../lib/types';
import { FiFolder } from 'solid-icons/fi';

export default function NoContextState() {
  const [showCreateModal, setShowCreateModal] = createSignal(false);
  const [newContextName, setNewContextName] = createSignal('');
  const [newContextType, setNewContextType] = createSignal<Context['type']>('Home');

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

  return (
    <>
      <div class="min-h-[60vh] flex items-center justify-center">
        <div class="text-center max-w-md mx-auto px-4">
          <div class="flex justify-center mb-6">
            <div class="p-6 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FiFolder class="w-16 h-16 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Finance Tracker
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-8">
            Get started by creating your first context. Contexts help you separate your finances - 
            like Personal, Work, or Business accounts.
          </p>
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            Create Your First Context
          </Button>
        </div>
      </div>

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
              placeholder="e.g., Personal, Work, Business"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
          
          <div class="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Context</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
