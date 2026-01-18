import { Show, createEffect, type JSX } from 'solid-js';
import { Portal } from 'solid-js/web';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: JSX.Element;
  maxWidth?: string;
}

export default function Modal(props: ModalProps) {
  // Handle escape key and auto-focus
  createEffect(() => {
    if (props.isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') props.onClose();
      };
      document.addEventListener('keydown', handleEscape);
      
      // Auto-focus first input
      setTimeout(() => {
        const modal = document.querySelector('[role="dialog"]');
        const firstInput = modal?.querySelector('input, textarea, select') as HTMLElement;
        firstInput?.focus();
      }, 100);
      
      return () => document.removeEventListener('keydown', handleEscape);
    }
  });

  return (
    <Show when={props.isOpen}>
      <Portal>
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={props.onClose}
          />
          
          {/* Modal */}
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            class={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full ${props.maxWidth || 'max-w-md'} max-h-[90vh] overflow-y-auto`}
          >
            <div class="flex justify-between items-center mb-4">
              <h3 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                {props.title}
              </h3>
              <button 
                onClick={props.onClose} 
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {props.children}
          </div>
        </div>
      </Portal>
    </Show>
  );
}
