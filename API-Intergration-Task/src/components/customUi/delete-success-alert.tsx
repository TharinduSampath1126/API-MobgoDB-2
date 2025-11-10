import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

type DeleteSuccessAlertProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string | null;
  okText?: string;
  cancelText?: string;
  /** Auto close the dialog after this many ms when opened. Set to 0 to disable. Default 3000. */
  autoCloseMs?: number;
};
export function DeleteSuccessAlert({
  open,
  onOpenChange,
  title = 'Deleted',
  message = 'User deleted successfully',
  okText = 'OK',
  // cancelText = 'Cancel',
  autoCloseMs = 3000,
}: DeleteSuccessAlertProps) {
  React.useEffect(() => {
    if (!open || !autoCloseMs) return;
    const t = setTimeout(() => onOpenChange(false), autoCloseMs);
    return () => clearTimeout(t);
  }, [open, autoCloseMs, onOpenChange]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-120 rounded-lg p-6">
        <div className="flex flex-col  text-center gap-4">
          <AlertDialogHeader className="flex mx-auto">
            <AlertDialogTitle className="text-xl font-semibold text-center">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground max-w-xs text-center">
              {message}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="mt-2">
          <div className="flex w-full justify-center gap-2">
            {/* keep cancel hidden by default; only primary OK */}
            <AlertDialogAction className="bg-green-600 hover:bg-green-700">{okText}</AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteSuccessAlert;
