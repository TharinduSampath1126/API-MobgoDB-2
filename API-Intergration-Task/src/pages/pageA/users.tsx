import { User } from '@/components/data-table/columns';
import { useCreateUser } from '@/hooks/useUserQueries';
import { useServerPagination } from '@/hooks/useServerPagination';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserForm } from '@/components/form/add-post-form';
import TableColumnsDropdown from '@/components/data-table/table-columns-dropdown';
import { ServerPagination } from '@/components/customUi/server-pagination';
import UsersTable from './tables/table-columns/users-table';
import { toast } from 'sonner';

type Props = {
  data?: User[];
  onAddData?: (data: User) => void;
};

export default function NewlyAddedUsersTable({ data, onAddData }: Props) {
  const createUserMutation = useCreateUser();
  const [addOpen, setAddOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [table, setTable] = React.useState<any | null>(null);
  
  // Use server-side pagination
  const {
    data: users,
    loading,
    error,
    pagination,
    fetchData,
    setLimit,
    refresh
  } = useServerPagination<User>({
    endpoint: 'http://localhost:5000/api/users',
    initialLimit: 10,
    searchQuery
  });

  // Handle query errors with toast notifications
  React.useEffect(() => {
    if (error) {
      console.error('Users query error:', error);
      toast.error(`Error loading users: ${error}`);
    }
  }, [error]);

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
      const newUser = await createUserMutation.mutateAsync(userData);
      console.log('User saved successfully to database:', newUser);
      // Refresh the paginated data
      await refresh();
      return newUser;
    } catch (error: any) {
      console.error('Failed to create user:', error);
      
      if (error?.response?.data?.field === 'id') {
        console.error('Duplicate ID detected, this should be handled by auto-generation');
        toast.error(`ID ${error.response.data.value} is already in use. Please try again.`);
      }
      
      throw error;
    }
  };

  // Calculate the next available ID
  const getNextId = React.useCallback(() => {
    if (data) {
      const existingIds = data.map(user => user.id || 0).filter(id => id > 0);
      return existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    }
    
    if (!users || users.length === 0) return 1;
    const existingIds = users.map(user => user.id || 0).filter(id => id > 0);
    return existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
  }, [data, users]);

  // Use provided data or server data
  const displayUsers = data || users;
  
  if (loading && !displayUsers.length) {
    return <div className="p-4">Loading users...</div>;
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Users</h2>

      <div className="flex justify-between">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4 max-w-sm"
        />

        <div className="flex gap-5">
          <TableColumnsDropdown table={table} />

          <Button 
            onClick={() => setAddOpen(true)}
            disabled={createUserMutation.isPending || loading}
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
        data={displayUsers}
        onTableChange={setTable}
      />

      {!data && (
        <div className="py-4">
          <ServerPagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            hasNext={pagination.hasNext}
            hasPrev={pagination.hasPrev}
            onPageChange={fetchData}
            onLimitChange={setLimit}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
