import { Show, For, createSignal } from 'solid-js';
import { contextStore } from '../stores/context';
import { useBudgets } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { showToast } from '../lib/toast';
import { getCategoryIcon, getCategoryColor } from '../lib/categoryIcons';
import type { Budget } from '../lib/types';
import { FiEdit2, FiTrash2, FiPlus, FiPieChart } from 'solid-icons/fi';

export default function Budgets() {
  const { data, refetch } = useBudgets(() => contextStore.currentContext?.id);
  const [showModal, setShowModal] = createSignal(false);
  const [editingBudget, setEditingBudget] = createSignal<Budget | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  const [budgetToDelete, setBudgetToDelete] = createSignal<number | null>(null);
  
  const [formData, setFormData] = createSignal({
    category: '',
    monthly_limit: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
  });

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other',
  ];

  const openCreateModal = () => {
    setEditingBudget(null);
    setFormData({
      category: '',
      monthly_limit: '',
      month: new Date().toISOString().slice(0, 7),
    });
    setShowModal(true);
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      monthly_limit: budget.monthly_limit.toString(),
      month: budget.month,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!contextStore.currentContext) return;

    try {
      const budgetData = {
        context_id: contextStore.currentContext.id,
        category: formData().category,
        monthly_limit: parseFloat(formData().monthly_limit),
        month: formData().month,
      };

      if (editingBudget()) {
        const { error } = await supabase
          .from('budgets')
          .update(budgetData)
          .eq('id', editingBudget()!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert(budgetData);
        if (error) throw error;
      }

      await refetch();
      setShowModal(false);
      showToast.success(editingBudget() ? 'Budget updated successfully' : 'Budget created successfully');
    } catch (error: any) {
      console.error('Error saving budget:', error);
      showToast.error(error?.message || 'Failed to save budget');
    }
  };

  const confirmDelete = (id: number) => {
    setBudgetToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    const id = budgetToDelete();
    if (!id) return;

    try {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
      await refetch();
      showToast.success('Budget deleted successfully');
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      showToast.error(error?.message || 'Failed to delete budget');
    }
  };

  const getProgress = (spent: number, limit: number) => {
    return Math.min((spent / limit) * 100, 100);
  };

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 80) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Budgets</h1>
        <Button onClick={openCreateModal} size="md">
          <FiPlus class="w-4 h-4 inline mr-2" />
          Add Budget
        </Button>
      </div>

      <Show when={!data.loading} fallback={<LoadingSkeleton />}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Show
            when={data() && data()!.length > 0}
            fallback={
              <div class="col-span-full">
                <EmptyState
                  icon={FiPieChart}
                  title="No Budgets Set"
                  description="Set monthly budgets for different categories to track your spending and stay on target."
                  actionLabel="Create Budget"
                  onAction={openCreateModal}
                />
              </div>
            }
          >
            <For each={data()}>
              {(budget) => (
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                  <div class="flex justify-between items-start mb-4">
                    <div class="flex items-start gap-3 flex-1">
                      <div class={`p-2 rounded-lg ${getCategoryColor(budget.category)}`}>
                        {(() => {
                          const Icon = getCategoryIcon(budget.category);
                          return <Icon class="w-5 h-5 text-white" />;
                        })()}
                      </div>
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                          {budget.category}
                        </h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                          {budget.month}
                        </p>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button
                        onClick={() => openEditModal(budget)}
                        class="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                      >
                        <FiEdit2 class="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(budget.id)}
                        class="text-red-600 hover:text-red-900 dark:text-red-400"
                      >
                        <FiTrash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600 dark:text-gray-400">Spent</span>
                      <span class="font-medium text-gray-900 dark:text-white">
                        ${budget.spent.toFixed(2)} / ${budget.monthly_limit.toFixed(2)}
                      </span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        class={`h-3 rounded-full transition-all ${getProgressColor(budget.spent, budget.monthly_limit)}`}
                        style={{ width: `${getProgress(budget.spent, budget.monthly_limit)}%` }}
                      />
                    </div>
                    <div class="flex justify-between text-xs">
                      <span class="text-gray-500 dark:text-gray-400">
                        {getProgress(budget.spent, budget.monthly_limit).toFixed(0)}% used
                      </span>
                      <span class={budget.spent > budget.monthly_limit ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                        ${(budget.monthly_limit - budget.spent).toFixed(2)} remaining
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
        title={editingBudget() ? 'Edit Budget' : 'Add Budget'}
      >
        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select
              value={formData().category}
              onChange={(e) => setFormData({ ...formData(), category: e.currentTarget.value })}
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select category</option>
              <For each={categories}>
                {(cat) => <option value={cat}>{cat}</option>}
              </For>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Monthly Limit *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData().monthly_limit}
              onInput={(e) => setFormData({ ...formData(), monthly_limit: e.currentTarget.value })}
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Month *
            </label>
            <input
              type="month"
              value={formData().month}
              onInput={(e) => setFormData({ ...formData(), month: e.currentTarget.value })}
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="flex gap-2 justify-end pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingBudget() ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm()}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
