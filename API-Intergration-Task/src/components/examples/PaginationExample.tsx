import React, { useState } from 'react';
import { useServerPagination } from '@/hooks/useServerPagination';
import { ServerPagination } from '@/components/customUi/server-pagination';
import { Input } from '@/components/ui/input';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  phone: string;
  birthDate: string;
}

export function PaginationExample() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    data: users,
    loading,
    error,
    pagination,
    fetchData,
    setLimit
  } = useServerPagination<User>({
    endpoint: 'http://localhost:5000/api/users',
    initialLimit: 5,
    searchQuery
  });

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Server-Side Pagination Example</h3>
        
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm mb-4"
        />
        
        {loading && <div>Loading...</div>}
        
        <div className="grid gap-2 mb-4">
          {users.map((user) => (
            <div key={user.id} className="p-3 border rounded-lg">
              <div className="font-medium">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-gray-600">
                {user.email} • Age: {user.age}
              </div>
            </div>
          ))}
        </div>
        
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
    </div>
  );
}