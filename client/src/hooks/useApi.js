// React Query API Hooks - Temporarily Disabled
// This file is temporarily disabled to avoid compilation issues
// Using useApiSimple.js instead for basic functionality

// All exports are empty to prevent compilation errors
export const useApiQuery = () => ({ data: null, isLoading: false, error: null });
export const useApiMutation = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });

// Contexts API hooks
export const useContexts = () => ({ data: null, isLoading: false, error: null });
export const useCreateContext = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });
export const useUpdateContext = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });
export const useDeleteContext = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });

// Transactions API hooks
export const useTransactions = () => ({ data: null, isLoading: false, error: null });
export const useCreateTransaction = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });
export const useUpdateTransaction = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });
export const useDeleteTransaction = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });

// Subscriptions API hooks
export const useSubscriptions = () => ({ data: null, isLoading: false, error: null });
export const useCreateSubscription = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });
export const useUpdateSubscription = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });
export const useDeleteSubscription = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });

// Savings API hooks
export const useSavings = () => ({ data: null, isLoading: false, error: null });
export const useCreateSaving = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });
export const useUpdateSaving = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });
export const useDeleteSaving = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });

// Budgets API hooks
export const useBudgets = () => ({ data: null, isLoading: false, error: null });
export const useCreateBudget = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });
export const useUpdateBudget = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });
export const useDeleteBudget = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });

// Investments API hooks
export const useInvestments = () => ({ data: null, isLoading: false, error: null });
export const useCreateInvestment = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });
export const useUpdateInvestment = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });
export const useDeleteInvestment = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });

// Dashboard API hooks
export const useDashboardData = () => ({ data: null, isLoading: false, error: null });

// Export/Import API hooks
export const useExportData = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });
export const useImportData = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });
export const useCreateBackup = () => ({ mutateAsync: () => Promise.resolve(), isPending: false, error: null });