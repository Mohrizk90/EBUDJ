import React from 'react';

export const CardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card animate-pulse">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2 flex-1">
                <div className="skeleton-text w-24"></div>
                <div className="skeleton-text w-16"></div>
              </div>
              <div className="skeleton-avatar"></div>
            </div>
            <div className="skeleton-text w-full mb-2"></div>
            <div className="skeleton-text w-3/4"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export const StatCardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card animate-pulse">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="skeleton-text w-20"></div>
                <div className="skeleton-text w-24 h-8"></div>
                <div className="skeleton-text w-16"></div>
              </div>
              <div className="skeleton-avatar"></div>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-gray-300 rounded-full w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="card">
      <div className="p-6">
        <div className="skeleton-text w-32 h-6 mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="skeleton-text flex-1"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Section Skeleton */}
      <div className="card animate-pulse">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="skeleton-text w-64 h-10"></div>
              <div className="skeleton-text w-96"></div>
              <div className="flex space-x-4 mt-4">
                <div className="skeleton-text w-20 h-6 rounded-full"></div>
                <div className="skeleton-text w-24 h-6 rounded-full"></div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="skeleton-avatar w-16 h-16"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <StatCardSkeleton />

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TableSkeleton />
        </div>
        <div className="space-y-6">
          <CardSkeleton count={3} />
        </div>
      </div>
    </div>
  );
};

export const ListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card animate-pulse">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <div className="skeleton-avatar"></div>
              <div className="flex-1 space-y-2">
                <div className="skeleton-text w-3/4"></div>
                <div className="skeleton-text w-1/2"></div>
              </div>
              <div className="skeleton-text w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const FormSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="skeleton-text w-48 h-8"></div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="skeleton-text w-24"></div>
            <div className="skeleton-text w-full h-10"></div>
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-3">
        <div className="skeleton-text w-20 h-10"></div>
        <div className="skeleton-text w-24 h-10"></div>
      </div>
    </div>
  );
};

export const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    gray: 'border-gray-600'
  };

  return (
    <div className={`animate-spin rounded-full border-4 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}></div>
  );
};

export const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default {
  CardSkeleton,
  StatCardSkeleton,
  TableSkeleton,
  DashboardSkeleton,
  ListSkeleton,
  FormSkeleton,
  LoadingSpinner,
  LoadingOverlay
};
