import { Show, For, createSignal } from 'solid-js';
import { contextStore } from '../stores/context';
import { useTransactions } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { showToast } from '../lib/toast';
import { getCategoryIcon, getCategoryColor } from '../lib/categoryIcons';
import { format } from 'date-fns';
import type { Transaction } from '../lib/types';
import { FiEdit2, FiTrash2, FiPlus, FiInbox } from 'solid-icons/fi';

export default function Transactions() {
  const { data, refetch } = useTransactions(() => contextStore.currentContext?.id);
  const [showModal, setShowModal] = createSignal(false);
  const [editingTransaction, setEditingTransaction] = createSignal<Transaction | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  const [transactionToDelete, setTransactionToDelete] = createSignal<number | null>(null);
  
  // Form state
  const [formData, setFormData] = createSignal({
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    type: 'Expense' as 'Income' | 'Expense',
    amount: '',
    account: '',
    notes: '',
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

  const accounts = ['Cash', 'Bank Account', 'Credit Card', 'Debit Card'];

  const openCreateModal = () => {
    setEditingTransaction(null);
    setFormData({
      description: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      type: 'Expense',
      amount: '',
      account: '',
      notes: '',
    });
    setShowModal(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      date: transaction.date,
      category: transaction.category,
      type: transaction.type,
      amount: transaction.amount.toString(),
      account: transaction.account,
      notes: transaction.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    if (!contextStore.currentContext) return;

    try {
      const transactionData = {
        context_id: contextStore.currentContext.id,
        description: formData().description,
        date: formData().date,
        category: formData().category,
        type: formData().type,
        amount: parseFloat(formData().amount),
        account: formData().account,
        notes: formData().notes || null,
      };

      if (editingTransaction()) {
        // Update existing transaction
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', editingTransaction()!.id);
        
        if (error) throw error;
      } else {
        // Create new transaction
        const { error } = await supabase
          .from('transactions')
          .insert(transactionData);
        
        if (error) throw error;

        // TODO: Call Edge Function for budget update
        // await supabase.functions.invoke('update-budget', {
        //   body: { transaction: transactionData }
        // });
      }

      await refetch();
      setShowModal(false);
      showToast.success(editingTransaction() ? 'Transaction updated successfully' : 'Transaction created successfully');
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      showToast.error(error?.message || 'Failed to save transaction');
    }
  };

  const confirmDelete = (id: number) => {
    setTransactionToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    const id = transactionToDelete();
    if (!id) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await refetch();
      showToast.success('Transaction deleted successfully');
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      showToast.error(error?.message || 'Failed to delete transaction');
    }
  };

  return (
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <Button onClick={openCreateModal} size="md">
          <FiPlus class="w-4 h-4 inline mr-2" />
          Add Transaction
        </Button>
      </div>

      <Show when={!data.loading} fallback={<LoadingSkeleton />}>
        {/* Desktop Table View */}
        <div class="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Account
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
                          icon={FiInbox}
                          title="No Transactions"
                          description="Start tracking your income and expenses by adding your first transaction."
                          actionLabel="Add Transaction"
                          onAction={openCreateModal}
                        />
                      </td>
                    </tr>
                  }
                >
                  <For each={data()}>
                    {(transaction) => (
                      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {format(new Date(transaction.date), 'MMM dd, yyyy')}
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {transaction.description}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {transaction.category}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.type === 'Income'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          ${transaction.amount.toFixed(2)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {transaction.account}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => openEditModal(transaction)}
                            class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <FiEdit2 class="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => confirmDelete(transaction.id)}
                            class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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

        {/* Mobile Card View */}
        <div class="md:hidden space-y-4">
          <Show
            when={data() && data()!.length > 0}
            fallback={
              <EmptyState
                icon={FiInbox}
                title="No Transactions"
                description="Start tracking your income and expenses by adding your first transaction."
                actionLabel="Add Transaction"
                onAction={openCreateModal}
              />
            }
          >
            <For each={data()}>
              {(transaction) => (
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div class="flex justify-between items-start mb-3">
                    <div class="flex items-start gap-3 flex-1">
                      <div class={`p-2 rounded-lg ${getCategoryColor(transaction.category)}`}>
                        {(() => {
                          const Icon = getCategoryIcon(transaction.category);
                          return <Icon class="w-5 h-5 text-white" />;
                        })()}
                      </div>
                      <div class="flex-1">
                        <h3 class="font-semibold text-gray-900 dark:text-white">
                          {transaction.description}
                        </h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {format(new Date(transaction.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <span class={`px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.type === 'Income'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {transaction.type}
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span class="text-gray-500 dark:text-gray-400">Amount:</span>
                      <span class={`ml-2 font-semibold ${
                        transaction.type === 'Income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        ${transaction.amount.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span class="text-gray-500 dark:text-gray-400">Category:</span>
                      <span class="ml-2 text-gray-900 dark:text-white">{transaction.category}</span>
                    </div>
                    <div class="col-span-2">
                      <span class="text-gray-500 dark:text-gray-400">Account:</span>
                      <span class="ml-2 text-gray-900 dark:text-white">{transaction.account}</span>
                    </div>
                  </div>
                  <div class="flex gap-2 justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => openEditModal(transaction)}
                      class="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded"
                    >
                      <FiEdit2 class="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(transaction.id)}
                      class="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded"
                    >
                      <FiTrash2 class="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </For>
          </Show>
        </div>
      </Show>

      {/* Transaction Modal */}
      <Modal
        isOpen={showModal()}
        onClose={() => setShowModal(false)}
        title={editingTransaction() ? 'Edit Transaction' : 'Add Transaction'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <input
                type="text"
                value={formData().description}
                onInput={(e) => setFormData({ ...formData(), description: e.currentTarget.value })}
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
                Type *
              </label>
              <select
                value={formData().type}
                onChange={(e) => setFormData({ ...formData(), type: e.currentTarget.value as 'Income' | 'Expense' })}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </div>

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
                Account *
              </label>
              <select
                value={formData().account}
                onChange={(e) => setFormData({ ...formData(), account: e.currentTarget.value })}
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select account</option>
                <For each={accounts}>
                  {(acc) => <option value={acc}>{acc}</option>}
                </For>
              </select>
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
              {editingTransaction() ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm()}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
