import { User } from '@/components/data-table/columns';
import RowsPerPageSelect from '@/components/customUi/rows-per-page-select';
import { usePostStore } from '@/store/postStore';
import { useUsers, useCreateUser } from '@/hooks/useUserQueries';
import React from 'react';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/customUi/pagination';
import { Button } from '@/components/ui/button';
import { UserForm } from '@/components/form/add-post-form';
import TableColumnsDropdown from '@/components/data-table/table-columns-dropdown';
import SuccessAlert from '@/components/customUi/success-alert';
import UsersTable from './tables/table-columns/users-table';
import { toast } from 'sonner';

type Props = {
  data?: User[];
  onAddData?: (data: User) => void;
};

export default function NewlyAddedUsersTable({ data, onAddData }: Props) {
  const { newPosts } = usePostStore();
  const { data: backendUsers, isLoading, error } = useUsers();
  const createUserMutation = useCreateUser();
  
  const [addOpen, setAddOpen] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);

  // Handle query errors with toast notifications
  React.useEffect(() => {
    if (error) {
      console.error('Users query error:', error);
      const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || 'Failed to fetch users';
      toast.error(`Error loading users: ${errorMessage}`);
    }
  }, [error]);

  const [table, setTable] = React.useState<any | null>(null);
  // pagination state (data-driven)
  const [currentPage, setCurrentPage] = React.useState(0);
  const pageSize = 10;

  const getColumn = React.useCallback(
    (id: string) => {
      if (!table) return undefined;
      if (typeof table.getColumn === 'function') return table.getColumn(id);
      if (table.table && typeof table.table.getColumn === 'function')
        return table.table.getColumn(id);
      return undefined;
    },
    [table]
  );

  const handleAdd = async (userData: User) => {
    if (onAddData) return onAddData(userData);
    
    try {
      console.log('Sending user data to backend:', userData);
      // Save to backend via React Query
      const newUser = await createUserMutation.mutateAsync(userData);
      console.log('User saved successfully to database:', newUser);
      // Don't add to local store - React Query will handle cache updates
      return newUser;
    } catch (error: any) {
      console.error('Failed to create user:', error);
      
      // Handle duplicate ID error specifically
      if (error?.response?.data?.field === 'id') {
        console.error('Duplicate ID detected, this should be handled by auto-generation');
        toast.error(`ID ${error.response.data.value} is already in use. Please try again.`);
      }
      
      throw error; // Let the form handle the error
    }
  };

  // Combine backend data with local store data
  const allUsers = React.useMemo(() => {
    if (data) return data;
    
    const backend = backendUsers || [];
    const local = newPosts || [];
    
    // If we have backend data, prioritize it and only add local items that don't exist in backend
    if (backend.length > 0) {
      const backendIds = new Set(backend.map(user => user.id));
      const uniqueLocal = local.filter(user => !backendIds.has(user.id));
      return [...backend, ...uniqueLocal];
    }
    
    // If no backend data, show local only
    return local;
  }, [data, backendUsers, newPosts]);

  // Calculate the next available ID with better checking
  const getNextId = React.useCallback(() => {
    if (!allUsers || allUsers.length === 0) return 1;
    
    // Get all existing IDs and sort them
    const existingIds = allUsers
      .map(user => user.id || 0)
      .filter(id => id > 0)
      .sort((a, b) => a - b);
    
    if (existingIds.length === 0) return 1;
    
    // Find the next available ID (handles gaps in sequence)
    for (let i = 1; i <= existingIds[existingIds.length - 1] + 1; i++) {
      if (!existingIds.includes(i)) {
        return i;
      }
    }
    
    // Fallback: return max + 1
    return Math.max(...existingIds) + 1;
  }, [allUsers]);

  if (isLoading) {
    return <div className="p-4">Loading users...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error loading users: {error.message}</div>;
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Users</h2>

      <div className="flex justify-between">
        <Input
          placeholder="Filter names..."
          value={(getColumn('firstName')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            getColumn('firstName')?.setFilterValue?.(event.target.value)
          }
          className="mb-4 max-w-sm"
        />

        <div className="flex gap-5">
          <TableColumnsDropdown table={table} />

          <Button 
            onClick={() => setAddOpen(true)}
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending ? 'Adding...' : 'Add Data'}
          </Button>
        </div>
      </div>

      <UserForm
        open={addOpen}
        onOpenChange={setAddOpen}
        nextId={getNextId()}
        onSubmit={async (d) => {
          try {
            await handleAdd(d as User);
            setAddOpen(false);
            setSuccessOpen(true);
          } catch (error) {
            // Error handling - could show error message
            console.error('Error creating user:', error);
          }
        }}
      />

      {/* <SuccessAlert open={successOpen} onOpenChange={setSuccessOpen} /> */}

      <UsersTable
        data={allUsers}
        onTableChange={setTable}
      />

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <RowsPerPageSelect
            value={`${table?.pageSize ?? 10}`}
            onValueChange={(value) => table?.setPageSize?.(Number(value))}
            className="h-8 w-[70px]"
          />
        </div>

        <DataTablePagination
          data={allUsers}
          pageSize={pageSize}
          pageIndex={currentPage}
          onPageChange={setCurrentPage}
          showPageJump={true}
        />
      </div>
    </div>
  );
}
