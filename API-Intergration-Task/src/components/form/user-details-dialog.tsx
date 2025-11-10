import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User } from '../data-table/columns';

interface UserDetailsDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl">User Details</DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
            <span className="text-sm font-semibold px-3 py-1 bg-gray-800 text-white">ID {user.id}</span>
          </div>

          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium text-gray-900">{user.email}</dd>
              </div>

              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-medium text-gray-900">{user.phone}</dd>
              </div>

              <div>
                <dt className="text-muted-foreground">Age</dt>
                <dd className="font-medium text-gray-900">{user.age}</dd>
              </div>

              <div>
                <dt className="text-muted-foreground">Birth Date</dt>
                <dd className="font-medium text-gray-900">{user.birthDate}</dd>
              </div>
            </dl>
        </div>
      </DialogContent>
    </Dialog>
  );
}