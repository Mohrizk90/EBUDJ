import { Show } from 'solid-js';
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export default function ConfirmDialog(props: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title={props.title}
    >
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-300">
          {props.message}
        </p>
        <div class="flex gap-2 justify-end">
          <Button
            variant="ghost"
            onClick={props.onClose}
          >
            {props.cancelText || 'Cancel'}
          </Button>
          <Button
            variant={props.variant || 'danger'}
            onClick={() => {
              props.onConfirm();
              props.onClose();
            }}
          >
            {props.confirmText || 'Confirm'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
