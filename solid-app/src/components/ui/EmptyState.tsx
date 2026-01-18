import type { JSX } from 'solid-js';
import Button from './Button';

interface EmptyStateProps {
  icon?: any;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState(props: EmptyStateProps) {
  return (
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
      {props.icon && (
        <div class="flex justify-center mb-4">
          <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
            <props.icon class="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      )}
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {props.title}
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {props.description}
      </p>
      {props.onAction && props.actionLabel && (
        <Button onClick={props.onAction}>
          {props.actionLabel}
        </Button>
      )}
    </div>
  );
}
