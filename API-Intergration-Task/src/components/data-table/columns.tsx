import { ColumnDef } from '@tanstack/react-table';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { UserForm } from '@/components/form/add-post-form';
import { usePostStore } from '@/store/postStore';
import { useUpdateUser, useDeleteUser } from '@/hooks/useUserQueries';
import { UserDetailsDialog } from '@/components/form/user-details-dialog';
import DeleteAlert from '@/components/customUi/delete-alert';

export const UserSchema = z.object({
  id: z.number().min(1, 'ID must be greater than 0'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  age: z
    .number()
    .min(1, 'Age must be greater than 0')
    .max(120, 'Age must be less than 120'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .refine(
      (email) => {
        // More strict email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
      },
      { message: 'Please enter a valid email address' }
    )
    .refine(
      (email) => {
        // Check for common email providers or allow any domain
        const domain = email.split('@')[1];
        return domain && domain.includes('.');
      },
      { message: 'Email must have a valid domain' }
    ),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine(
      (phone) => {
        // Allow phone numbers with country codes (+1, +94, etc.) and various formats
        const phoneRegex = /^(\+\d{1,3}[- ]?)?\(?\d{1,4}\)?[- ]?\d{1,4}[- ]?\d{1,9}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
      },
      { message: 'Please enter a valid phone number (e.g., +1 123 456 7890 or +94 77 123 4567)' }
    ),
  birthDate: z
    .string()
    .min(1, 'Birth date is required')
    .refine(
      (date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Set to end of today
        return selectedDate <= today;
      },
      { message: 'Birth date cannot be in the future' }
    ),
});

export type User = z.infer<typeof UserSchema>;


function ActionsCell({ user }: { user: User }) {
  const [showDialog, setShowDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { updatePost, removePost } = usePostStore();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const handleDeleteClick = () => setDeleteOpen(true);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Always delete from backend since we're using consistent number IDs
      await deleteUserMutation.mutateAsync(user.id);
      setDeleteOpen(false);
    } catch (error) {
      console.error('Failed to delete user:', error);
      // Fallback to local store removal if backend fails
      try {
        await Promise.resolve(removePost(user.id));
        setDeleteOpen(false);
      } catch (localError) {
        console.error('Failed to remove from local store:', localError);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (updatedUser: User) => {
    try {
      console.log('Attempting to update user:', updatedUser);
      // Always update in backend since we're using consistent number IDs
      const result = await updateUserMutation.mutateAsync(updatedUser);
      console.log('Update successful:', result);
    } catch (error) {
      console.error('Failed to update user:', error);
      // Fallback to local store update if backend fails
      updatePost(updatedUser);
      throw error;
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDialog(true)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowEditDialog(true)}
          className="h-8 w-8 p-0"
          disabled={updateUserMutation.isPending}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          id="trash"
          variant="ghost"
          size="sm"
          onClick={handleDeleteClick}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
          disabled={deleteUserMutation.isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <UserDetailsDialog
        user={user}
        open={showDialog}
        onOpenChange={setShowDialog}
      />

      <UserForm
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        initialData={user}
        isEdit
        onSubmit={handleUpdate}
      />

      <DeleteAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        itemName={`${user.firstName} ${user.lastName}`}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting || deleteUserMutation.isPending}
      />
    </>
  );
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'firstName',
    header: 'First Name',
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'age',
    header: 'Age',
  },
  {
    accessorKey: 'birthDate',
    header: 'Birth Date',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionsCell user={row.original} />,
  },
];
