import { Show, For, createSignal } from 'solid-js';
import { contextStore } from '../stores/context';
import { useInvestments } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { showToast } from '../lib/toast';
import type { Investment } from '../lib/types';
import { FiEdit2, FiTrash2, FiPlus, FiTrendingUp } from 'solid-icons/fi';
import { format } from 'date-fns';

export default function Investments() {
  const { data, refetch } = useInvestments(() => contextStore.currentContext?.id);
  const [showModal, setShowModal] = createSignal(false);
  const [editingInvestment, setEditingInvestment] = createSignal<Investment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  const [investmentToDelete, setInvestmentToDelete] = createSignal<number | null>(null);
  
  const [formData, setFormData] = createSignal({
    asset_name: '',
    type: 'Stock' as Investment['type'],
    amount_invested: '',
    current_value: '',
    date_invested: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const investmentTypes: Investment['type'][] = [
    'Stock',
    'Bond',
    'Mutual Fund',
    'ETF',
    'Crypto',
    'Real Estate',
    'Commodity',
    'REIT',
    'Options',
    'Futures',
    'Forex',
    'Other',
  ];

  const openCreateModal = () => {
    setEditingInvestment(null);
    setFormData({
      asset_name: '',
      type: 'Stock',
      amount_invested: '',
      current_value: '',
      date_invested: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowModal(true);
  };

  const openEditModal = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormData({
      asset_name: investment.asset_name,
      type: investment.type,
      amount_invested: investment.amount_invested.toString(),
      current_value: investment.current_value.toString(),
      date_invested: investment.date_invested,
      notes: investment.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!contextStore.currentContext) return;

    try {
      const investmentData = {
        context_id: contextStore.currentContext.id,
        asset_name: formData().asset_name,
        type: formData().type,
        amount_invested: parseFloat(formData().amount_invested),
        current_value: parseFloat(formData().current_value),
        date_invested: formData().date_invested,
        notes: formData().notes || null,
      };

      if (editingInvestment()) {
        const { error } = await supabase
          .from('investments')
          .update(investmentData)
          .eq('id', editingInvestment()!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('investments')
          .insert(investmentData);
        if (error) throw error;
      }

      await refetch();
      setShowModal(false);
      showToast.success(editingInvestment() ? 'Investment updated successfully' : 'Investment created successfully');
    } catch (error: any) {
      console.error('Error saving investment:', error);
      showToast.error(error?.message || 'Failed to save investment');
    }
  };

  const confirmDelete = (id: number) => {
    setInvestmentToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    const id = investmentToDelete();
    if (!id) return;

    try {
      const { error } = await supabase.from('investments').delete().eq('id', id);
      if (error) throw error;
      await refetch();
      showToast.success('Investment deleted successfully');
    } catch (error: any) {
      console.error('Error deleting investment:', error);
      showToast.error(error?.message || 'Failed to delete investment');
    }
  };

  const calculateReturn = (invested: number, current: number) => {
    const diff = current - invested;
    const percentage = ((diff / invested) * 100).toFixed(2);
    return { diff, percentage };
  };

  return (
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Investments</h1>
        <Button onClick={openCreateModal} size="md">
          <FiPlus class="w-4 h-4 inline mr-2" />
          Add Investment
        </Button>
      </div>

      <Show when={!data.loading} fallback={<LoadingSkeleton />}>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Asset
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Invested
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Return
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <Show
                  when={data() && data()!.length > 0}
                  fallback={
                    <tr>
                      <td colspan="7" class="p-8">
                        <EmptyState
                          icon={FiTrendingUp}
                          title="No Investments"
                          description="Track your investment portfolio including stocks, bonds, crypto, and more. Monitor your returns and diversification."
                          actionLabel="Add Investment"
                          onAction={openCreateModal}
                        />
                      </td>
                    </tr>
                  }
                >
                  <For each={data()}>
                    {(investment) => {
                      const returns = calculateReturn(investment.amount_invested, investment.current_value);
                      return (
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {investment.asset_name}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {investment.type}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            ${investment.amount_invested.toFixed(2)}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            ${investment.current_value.toFixed(2)}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <div class={returns.diff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              <div class="font-medium">
                                {returns.diff >= 0 ? '+' : ''}${returns.diff.toFixed(2)}
                              </div>
                              <div class="text-xs">
                                {returns.percentage}%
                              </div>
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(investment.date_invested), 'MMM dd, yyyy')}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => openEditModal(investment)}
                              class="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                            >
                              <FiEdit2 class="w-4 h-4 inline" />
                            </button>
                            <button
                              onClick={() => confirmDelete(investment.id)}
                              class="text-red-600 hover:text-red-900 dark:text-red-400"
                            >
                              <FiTrash2 class="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    }}
                  </For>
                </Show>
              </tbody>
            </table>
          </div>
        </div>
      </Show>

      <Modal
        isOpen={showModal()}
        onClose={() => setShowModal(false)}
        title={editingInvestment() ? 'Edit Investment' : 'Add Investment'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Asset Name *
              </label>
              <input
                type="text"
                value={formData().asset_name}
                onInput={(e) => setFormData({ ...formData(), asset_name: e.currentTarget.value })}
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Apple Inc., Bitcoin"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type *
              </label>
              <select
                value={formData().type}
                onChange={(e) => setFormData({ ...formData(), type: e.currentTarget.value as Investment['type'] })}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <For each={investmentTypes}>
                  {(type) => <option value={type}>{type}</option>}
                </For>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Invested *
              </label>
              <input
                type="date"
                value={formData().date_invested}
                onInput={(e) => setFormData({ ...formData(), date_invested: e.currentTarget.value })}
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount Invested *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData().amount_invested}
                onInput={(e) => setFormData({ ...formData(), amount_invested: e.currentTarget.value })}
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Value *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData().current_value}
                onInput={(e) => setFormData({ ...formData(), current_value: e.currentTarget.value })}
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData().notes}
                onInput={(e) => setFormData({ ...formData(), notes: e.currentTarget.value })}
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div class="flex gap-2 justify-end pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingInvestment() ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm()}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Investment"
        message="Are you sure you want to delete this investment? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
