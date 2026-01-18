import { Router, Route } from '@solidjs/router';
import { lazy, onMount } from 'solid-js';
import { Toaster } from 'solid-toast';
import Layout from './components/Layout';
import { contextActions } from './stores/context';
import { themeActions } from './stores/theme';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Budgets = lazy(() => import('./pages/Budgets'));
const Savings = lazy(() => import('./pages/Savings'));
const Investments = lazy(() => import('./pages/Investments'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));

export default function App() {
  onMount(() => {
    // Initialize theme
    themeActions.initTheme();
    
    // Load contexts
    contextActions.loadContexts();
  });

  return (
    <>
      <Toaster />
      <Router>
        <Route path="/" component={Layout}>
          <Route path="/" component={Dashboard} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/budgets" component={Budgets} />
          <Route path="/savings" component={Savings} />
          <Route path="/investments" component={Investments} />
          <Route path="/subscriptions" component={Subscriptions} />
        </Route>
      </Router>
    </>
  );
}
