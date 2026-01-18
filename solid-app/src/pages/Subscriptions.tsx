import { Show, For, createSignal } from 'solid-js';
import { contextStore } from '../stores/context';
import { useSubscriptions } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { showToast } from '../lib/toast';
import type { Subscription } from '../lib/types';
import { FiEdit2, FiTrash2, FiPlus, FiRepeat } from 'solid-icons/fi';
import { format, parseISO, addDays, addWeeks, addMonths, addYears } from 'date-fns';

export default function Subscriptions() {
  const { data, refetch } = useSubscriptions(() => contextStore.currentContext?.id);
  const [showModal, setShowModal] = createSignal(false);
  const [editingSubscription, setEditingSubscription] = createSignal<Subscription | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = createSignal<number | null>(null);
  
  const [formData, setFormData] = createSignal({
    service: '',
    amount: '',
    frequency: 'monthly' as Subscription['frequency'],
    next_billing_date: new Date().toISOString().split('T')[0],
    status: 'Active' as Subscription['status'],
  });

  const openCreateModal = () => {
    setEditingSubscription(null);
    setFormData({
      service: '',
      amount: '',
      frequency: 'monthly',
      next_billing_date: new Date().toISOString().split('T')[0],
      status: 'Active',
    });
    setShowModal(true);
  };

  const openEditModal = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      service: subscription.service,
      amount: subscription.amount.toString(),
      frequency: subscription.frequency,
      next_billing_date: subscription.next_billing_date,
      status: subscription.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!contextStore.currentContext) return;

    try {
      const subscriptionData = {
        context_id: contextStore.currentContext.id,
        service: formData().service,
        amount: parseFloat(formData().amount),
        frequency: formData().frequency,
        next_billing_date: formData().next_billing_date,
        status: formData().status,
      };

      if (editingSubscription()) {
        const { error } = await supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('id', editingSubscription()!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subscriptions')
          .insert(subscriptionData);
        if (error) throw error;
      }

      await refetch();
      setShowModal(false);
      showToast.success(editingSubscription() ? 'Subscription updated successfully' : 'Subscription created successfully');
    } catch (error: any) {
      console.error('Error saving subscription:', error);
      showToast.error(error?.message || 'Failed to save subscription');
    }
  };

  const confirmDelete = (id: number) => {
    setSubscriptionToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    const id = subscriptionToDelete();
    if (!id) return;

    try {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) throw error;
      await refetch();
      showToast.success('Subscription deleted successfully');
    } catch (error: any) {
      console.error('Error deleting subscription:', error);
      showToast.error(error?.message || 'Failed to delete subscription');
    }
  };

  const getStatusColor = (status: Subscription['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  const getYearlyCost = (amount: number, frequency: Subscription['frequency']) => {
    switch (frequency) {
      case 'daily': return amount * 365;
      case 'weekly': return amount * 52;
      case 'monthly': return amount * 12;
      case 'yearly': return amount;
    }
  };

  return (
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
        <Button onClick={openCreateModal} size="md">
          <FiPlus class="w-4 h-4 inline mr-2" />
          Add Subscription
        </Button>
      </div>

      <Show when={!data.loading} fallback={<LoadingSkeleton />}>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Service
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Yearly Cost
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Next Billing
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
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
                          icon={FiRepeat}
                          title="No Subscriptions"
                          description="Keep track of your recurring subscriptions like Netflix, Spotify, and more. Never miss a billing date!"
                          actionLabel="Add Subscription"
                          onAction={openCreateModal}
                        />
                      </td>
                    </tr>
                  }
                >
                  <For each={data()}>
                    {(subscription) => (
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {subscription.service}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${subscription.amount.toFixed(2)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {subscription.frequency}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          ${getYearlyCost(subscription.amount, subscription.frequency).toFixed(2)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(subscription.next_billing_date), 'MMM dd, yyyy')}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                            {subscription.status}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => openEditModal(subscription)}
                            class="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                          >
                            <FiEdit2 class="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => confirmDelete(subscription.id)}
                            class="text-red-600 hover:text-red-900 dark:text-red-400"
                          >
                            <FiTrash2 class="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    )}
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
        title={editingSubscription() ? 'Edit Subscription' : 'Add Subscription'}
      >
        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service Name *
            </label>
            <input
              type="text"
              value={formData().service}
              onInput={(e) => setFormData({ ...formData(), service: e.currentTarget.value })}
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Netflix, Spotify"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount *
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
                Frequency *
              </label>
              <select
                value={formData().frequency}
                onChange={(e) => setFormData({ ...formData(), frequency: e.currentTarget.value as Subscription['frequency'] })}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Next Billing Date *
            </label>
            <input
              type="date"
              value={formData().next_billing_date}
              onInput={(e) => setFormData({ ...formData(), next_billing_date: e.currentTarget.value })}
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status *
            </label>
            <select
              value={formData().status}
              onChange={(e) => setFormData({ ...formData(), status: e.currentTarget.value as Subscription['status'] })}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div class="flex gap-2 justify-end pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingSubscription() ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm()}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
