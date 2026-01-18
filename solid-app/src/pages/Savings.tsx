import { Show, For, createSignal } from 'solid-js';
import { contextStore } from '../stores/context';
import { useSavings } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { showToast } from '../lib/toast';
import type { Savings } from '../lib/types';
import { FiEdit2, FiTrash2, FiPlus, FiSave } from 'solid-icons/fi';
import { format } from 'date-fns';

export default function SavingsPage() {
  const { data, refetch } = useSavings(() => contextStore.currentContext?.id);
  const [showModal, setShowModal] = createSignal(false);
  const [editingSaving, setEditingSaving] = createSignal<Savings | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  const [savingToDelete, setSavingToDelete] = createSignal<number | null>(null);
  
  const [formData, setFormData] = createSignal({
    account: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    goal: '',
    description: '',
  });

  const openCreateModal = () => {
    setEditingSaving(null);
    setFormData({
      account: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      goal: '',
      description: '',
    });
    setShowModal(true);
  };

  const openEditModal = (saving: Savings) => {
    setEditingSaving(saving);
    setFormData({
      account: saving.account,
      date: saving.date,
      amount: saving.amount.toString(),
      goal: saving.goal.toString(),
      description: saving.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!contextStore.currentContext) return;

    try {
      const savingData = {
        context_id: contextStore.currentContext.id,
        account: formData().account,
        date: formData().date,
        amount: parseFloat(formData().amount),
        goal: parseFloat(formData().goal),
        description: formData().description || null,
      };

      if (editingSaving()) {
        const { error } = await supabase
          .from('savings')
          .update(savingData)
          .eq('id', editingSaving()!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('savings')
          .insert(savingData);
        if (error) throw error;
      }

      await refetch();
      setShowModal(false);
      showToast.success(editingSaving() ? 'Savings goal updated successfully' : 'Savings goal created successfully');
    } catch (error: any) {
      console.error('Error saving:', error);
      showToast.error(error?.message || 'Failed to save savings goal');
    }
  };

  const confirmDelete = (id: number) => {
    setSavingToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    const id = savingToDelete();
    if (!id) return;

    try {
      const { error } = await supabase.from('savings').delete().eq('id', id);
      if (error) throw error;
      await refetch();
      showToast.success('Savings goal deleted successfully');
    } catch (error: any) {
      console.error('Error deleting:', error);
      showToast.error(error?.message || 'Failed to delete savings goal');
    }
  };

  const getProgress = (amount: number, goal: number) => {
    return Math.min((amount / goal) * 100, 100);
  };

  return (
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Savings</h1>
        <Button onClick={openCreateModal} size="md">
          <FiPlus class="w-4 h-4 inline mr-2" />
          Add Savings Goal
        </Button>
      </div>

      <Show when={!data.loading} fallback={<LoadingSkeleton />}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Show
            when={data() && data()!.length > 0}
            fallback={
              <div class="col-span-full">
                <EmptyState
                  icon={FiSave}
                  title="No Savings Goals"
                  description="Set savings goals to track your progress towards financial milestones like emergency funds or vacation savings."
                  actionLabel="Create Savings Goal"
                  onAction={openCreateModal}
                />
              </div>
            }
          >
            <For each={data()}>
              {(saving) => (
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        {saving.account}
                      </h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        {saving.description || 'No description'}
                      </p>
                      <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {format(new Date(saving.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div class="flex gap-2">
                      <button
                        onClick={() => openEditModal(saving)}
                        class="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                      >
                        <FiEdit2 class="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(saving.id)}
                        class="text-red-600 hover:text-red-900 dark:text-red-400"
                      >
                        <FiTrash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600 dark:text-gray-400">Progress</span>
                      <span class="font-medium text-gray-900 dark:text-white">
                        ${saving.amount.toFixed(2)} / ${saving.goal.toFixed(2)}
                      </span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        class="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${getProgress(saving.amount, saving.goal)}%` }}
                      />
                    </div>
                    <div class="flex justify-between text-xs">
                      <span class="text-gray-500 dark:text-gray-400">
                        {getProgress(saving.amount, saving.goal).toFixed(0)}% achieved
                      </span>
                      <span class="text-gray-500 dark:text-gray-400">
                        ${(saving.goal - saving.amount).toFixed(2)} remaining
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </Show>
        </div>
      </Show>

      <Modal
        isOpen={showModal()}
        onClose={() => setShowModal(false)}
        title={editingSaving() ? 'Edit Savings Goal' : 'Add Savings Goal'}
      >
        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Account Name *
            </label>
            <input
              type="text"
              value={formData().account}
              onInput={(e) => setFormData({ ...formData(), account: e.currentTarget.value })}
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Emergency Fund"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Amount *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData().amount}
              onInput={(e) => setFormData({ ...formData(), amount: e.currentTarget.value })}
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Goal Amount *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData().goal}
              onInput={(e) => setFormData({ ...formData(), goal: e.currentTarget.value })}
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData().date}
              onInput={(e) => setFormData({ ...formData(), date: e.currentTarget.value })}
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData().description}
              onInput={(e) => setFormData({ ...formData(), description: e.currentTarget.value })}
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="flex gap-2 justify-end pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingSaving() ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm()}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Savings Goal"
        message="Are you sure you want to delete this savings goal? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
