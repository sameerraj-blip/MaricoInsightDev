import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface EditInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => Promise<void>;
  title: string;
  initialText: string;
  isLoading?: boolean;
}

export function EditInsightModal({
  isOpen,
  onClose,
  onSave,
  title,
  initialText,
  isLoading = false,
}: EditInsightModalProps) {
  const [text, setText] = useState(initialText);

  // Update text when initialText changes (when modal opens with different content)
  React.useEffect(() => {
    if (isOpen) {
      setText(initialText);
    }
  }, [isOpen, initialText]);

  const handleSave = async () => {
    if (text.trim()) {
      await onSave(text.trim());
    }
  };

  const handleCancel = () => {
    setText(initialText);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit {title}</DialogTitle>
          <DialogDescription>
            Make changes to the {title.toLowerCase()}. Click OK when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Enter ${title.toLowerCase()}...`}
            className="min-h-[150px] resize-none"
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !text.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'OK'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

