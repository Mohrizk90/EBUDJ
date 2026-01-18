import { Show } from 'solid-js';
import type { JSX } from 'solid-js';
import { A } from '@solidjs/router';
import { contextStore } from '../stores/context';
import ContextSelector from './ContextSelector';
import ThemeToggle from './ThemeToggle';
import NoContextState from './NoContextState';
import { 
  FiHome, 
  FiDollarSign, 
  FiTrendingUp, 
  FiPieChart, 
  FiSave,
  FiRepeat 
} from 'solid-icons/fi';

interface LayoutProps {
  children?: JSX.Element;
}

export default function Layout(props: LayoutProps) {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: FiHome },
    { path: '/transactions', label: 'Transactions', icon: FiDollarSign },
    { path: '/budgets', label: 'Budgets', icon: FiPieChart },
    { path: '/savings', label: 'Savings', icon: FiSave },
    { path: '/investments', label: 'Investments', icon: FiTrendingUp },
    { path: '/subscriptions', label: 'Subscriptions', icon: FiRepeat },
  ];

  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header class="bg-white dark:bg-gray-800 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                Finance Tracker
              </h1>
              <ContextSelector />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav class="bg-white dark:bg-gray-800 shadow-sm border-t border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => (
              <A
                href={item.path}
                class="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap"
                activeClass="bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                inactiveClass="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <item.icon class="w-4 h-4" />
                {item.label}
              </A>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Show when={contextStore.currentContext} fallback={<NoContextState />}>
          {props.children}
        </Show>
      </main>

      {/* Footer */}
      <footer class="bg-white dark:bg-gray-800 shadow-sm mt-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p class="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2026 Finance Tracker - Built with SolidJS & Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}
