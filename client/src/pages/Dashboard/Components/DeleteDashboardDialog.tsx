import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog for deleting a dashboard
 */
export const DeleteDashboardDialog = ({
  open,
  onOpenChange,
  dashboardName,
  onConfirm,
  onCancel,
}: DeleteDashboardDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Dashboard</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{dashboardName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

