import { AlertTriangle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Location } from '../types';
import { useDeleteLocation } from '../hooks/useLocations';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  location,
}: DeleteConfirmModalProps) {
  const deleteMutation = useDeleteLocation(() => {
    onClose();
  });

  if (!location) return null;

  const handleDelete = () => {
    const id = location._id || location.id!;
    deleteMutation.mutate(id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Location"
      description="This action cannot be undone."
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-3.5 border border-rose-100 text-rose-800">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="text-xs leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-rose-950">"{location.name}"</span>?
            This place will be permanently removed from MongoDB and all explorer maps.
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={deleteMutation.isPending}
            onClick={handleDelete}
          >
            Delete Permanently
          </Button>
        </div>
      </div>
    </Modal>
  );
}
