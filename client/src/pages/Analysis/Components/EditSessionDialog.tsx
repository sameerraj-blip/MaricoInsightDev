import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  onFileNameChange: (fileName: string) => void;
  isUpdating: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Dialog component for editing a session's file name
 */
export const EditSessionDialog = ({
  open,
  onOpenChange,
  fileName,
  onFileNameChange,
  isUpdating,
  onConfirm,
  onCancel,
}: EditSessionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Analysis Name</DialogTitle>
          <DialogDescription>
            Update the name for this analysis session. This will help you identify it more easily.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Analysis Name</Label>
            <Input
              id="edit-name"
              value={fileName}
              onChange={(e) => onFileNameChange(e.target.value)}
              placeholder="Enter analysis name"
              disabled={isUpdating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && fileName.trim() && !isUpdating) {
                  onConfirm();
                }
              }}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isUpdating || !fileName.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

