import { Check } from "@/app/lib/lucide-icons";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

interface PromoteSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function PromoteSuccessDialog({ isOpen, onClose, message }: PromoteSuccessDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-[#145F33]" />
          </div>
          <DialogTitle className="text-center text-xl">
            Successfully Promoted to Admissions!
          </DialogTitle>
          <DialogDescription className="sr-only">
            The lead has been successfully promoted to admissions
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-line">
            {message}
          </div>
          <Button
            onClick={onClose}
            className="w-full h-10 px-6 text-[14px] font-medium rounded-full text-white"
            style={{ backgroundColor: '#145F33' }}
          >
            Go to Admissions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}