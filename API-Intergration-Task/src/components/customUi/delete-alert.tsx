// React import not required with automatic JSX runtime
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';

type DeleteAlertProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title?: string;
	description?: string | null;
	confirmText?: string;
	cancelText?: string;
	/** Called when user confirms. Can be async. */
	onConfirm: () => Promise<void> | void;
	isLoading?: boolean;
	/** optional name of item being deleted to include in the message */
	itemName?: string;
};

export function DeleteAlert({
	open,
	onOpenChange,
	title = 'Delete item',
	description = null,
	confirmText = 'Delete',
	cancelText = 'Cancel',
	onConfirm,
	isLoading = false,
	itemName,
}: DeleteAlertProps) {
	const handleConfirm = async () => {
		try {
			await Promise.resolve(onConfirm());
			// close on success
			onOpenChange(false);
		} catch (err) {
			// keep dialog open on error; log for now
			// In future we could surface the error to the caller
			// eslint-disable-next-line no-console
			console.error('Delete action failed', err);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="max-w-120 rounded-lg p-6">
				<AlertDialogHeader>
					<AlertDialogTitle className="text-lg font-semibold">{title}</AlertDialogTitle>
					<AlertDialogDescription>
						{description ?? (
							<>
								Are you sure you want to delete{' '}
								<span className="font-medium">{itemName ?? 'this item'}</span>
								? This action cannot be undone.
							</>
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter className="mt-4">
					<div className="flex w-full justify-end gap-2">
						<AlertDialogCancel>{cancelText}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirm}
							className={buttonVariants({ variant: 'destructive' })}
						>
							{isLoading ? 'Deleting...' : confirmText}
						</AlertDialogAction>
					</div>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default DeleteAlert;

