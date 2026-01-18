export default function LoadingSkeleton() {
  return (
    <div class="space-y-4 animate-pulse">
      <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  );
}
