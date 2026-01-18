import { Show, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { contextStore } from '../stores/context';
import { useDashboardData } from '../hooks/useSupabase';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import SpendingChart from '../components/SpendingChart';
import { format } from 'date-fns';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiRefreshCw, FiInbox } from 'solid-icons/fi';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, refetch } = useDashboardData(() => contextStore.currentContext?.id);

  const StatCard = (props: { title: string; value: number; color: string; icon: any; iconBg: string }) => (
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            {props.title}
          </h3>
          <p class={`text-3xl font-bold mt-2 ${props.color}`}>
            ${props.value.toFixed(2)}
          </p>
        </div>
        <div class={`p-3 rounded-full ${props.iconBg}`}>
          <props.icon class="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <button
          onClick={() => refetch()}
          class="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <FiRefreshCw class="w-4 h-4" />
          Refresh
        </button>
      </div>

      <Show 
        when={!data.loading && data()} 
        fallback={<LoadingSkeleton />}
      >
        {(dashboardData) => (
          <>
            {/* Stats Grid */}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Income"
                value={dashboardData().totalIncome}
                color="text-green-600 dark:text-green-400"
                icon={FiTrendingUp}
                iconBg="bg-green-500"
              />
              <StatCard
                title="Total Expenses"
                value={dashboardData().totalExpenses}
                color="text-red-600 dark:text-red-400"
                icon={FiTrendingDown}
                iconBg="bg-red-500"
              />
              <StatCard
                title="Net Income"
                value={dashboardData().netIncome}
                color={dashboardData().netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                icon={FiDollarSign}
                iconBg={dashboardData().netIncome >= 0 ? 'bg-green-500' : 'bg-red-500'}
              />
            </div>

            {/* Recent Transactions */}
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Transactions
                </h2>
              </div>
              <div class="divide-y divide-gray-200 dark:divide-gray-700">
                <Show
                  when={dashboardData().recentTransactions.length > 0}
                  fallback={
                    <div class="p-8">
                      <EmptyState
                        icon={FiInbox}
                        title="No Transactions Yet"
                        description="Start tracking your finances by adding your first transaction. It's quick and easy!"
                        actionLabel="Add Transaction"
                        onAction={() => navigate('/transactions')}
                      />
                    </div>
                  }
                >
                  <For each={dashboardData().recentTransactions}>
                    {(transaction) => (
                      <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div class="flex justify-between items-start">
                          <div>
                            <p class="font-medium text-gray-900 dark:text-white">
                              {transaction.description}
                            </p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                              {transaction.category} • {format(new Date(transaction.date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div class="text-right">
                            <p class={`font-semibold ${
                              transaction.type === 'Income'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {transaction.type === 'Income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                            </p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                              {transaction.account}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </Show>
              </div>
            </div>

            {/* Spending Visualization */}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progress Bars */}
              <Show when={dashboardData().spendingByCategory.length > 0}>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Spending by Category (This Month)
                  </h2>
                  <div class="space-y-3">
                    <For each={dashboardData().spendingByCategory}>
                      {(item) => (
                        <div>
                          <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-700 dark:text-gray-300">{item.category}</span>
                            <span class="font-medium text-gray-900 dark:text-white">
                              ${item.total.toFixed(2)}
                            </span>
                          </div>
                          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              class="bg-blue-600 h-2.5 rounded-full transition-all"
                              style={{
                                width: `${Math.min((item.total / dashboardData().totalExpenses) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              </Show>

              {/* Pie Chart */}
              <SpendingChart data={dashboardData().spendingByCategory} />
            </div>
          </>
        )}
      </Show>
    </div>
  );
}
