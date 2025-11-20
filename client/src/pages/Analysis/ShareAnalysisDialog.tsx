import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { sharedAnalysesApi } from "@/api/sharedAnalyses";
import { useToast } from "@/hooks/use-toast";

interface ShareAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId?: string;
  fileName?: string;
}

export const ShareAnalysisDialog = ({
  open,
  onOpenChange,
  sessionId,
  fileName,
}: ShareAnalysisDialogProps) => {
  const [targetEmail, setTargetEmail] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setTargetEmail("");
    setNote("");
  };

  const handleClose = (next: boolean) => {
    if (!isSubmitting) {
      if (!next) {
        resetForm();
      }
      onOpenChange(next);
    }
  };

  const handleShare = async () => {
    if (!sessionId || !targetEmail.trim()) return;
    setIsSubmitting(true);
    try {
      await sharedAnalysesApi.share({
        sessionId,
        targetEmail: targetEmail.trim(),
        note: note.trim() || undefined,
      });
      toast({
        title: "Invite sent",
        description: `${fileName ?? "Analysis"} was shared with ${targetEmail.trim()}.`,
      });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to share analysis.";
      toast({
        title: "Share failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share analysis</DialogTitle>
          <DialogDescription>
            Invite a teammate to co-own <span className="font-semibold">{fileName}</span>. Once they accept, you’ll both work
            inside the same live analysis.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="share-email">Recipient email</Label>
            <Input
              id="share-email"
              type="email"
              placeholder="teammate@example.com"
              value={targetEmail}
              onChange={(event) => setTargetEmail(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="share-note">Message (optional)</Label>
            <Textarea
              id="share-note"
              placeholder="Add context for your teammate..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={!targetEmail.trim() || isSubmitting}>
            {isSubmitting ? "Sending..." : "Send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

