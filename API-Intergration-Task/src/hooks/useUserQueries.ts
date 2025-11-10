import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@/components/data-table/columns';
import { userApi } from '@/apis/user';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

// React Query hooks
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: userApi.fetchUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: (newUser) => {
      // Optimistically update the cache - add to top of list
      queryClient.setQueryData<User[]>(userKeys.lists(), (old) => {
        if (!old) return [newUser];
        return [newUser, ...old];
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.updateUser,
    onSuccess: (updatedUser) => {
      // Optimistically update the cache
      queryClient.setQueryData<User[]>(userKeys.lists(), (old) => {
        if (!old) return [updatedUser];
        return old.map((user) => 
          user.id === updatedUser.id ? updatedUser : user
        );
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: (_, deletedId) => {
      // Optimistically update the cache
      queryClient.setQueryData<User[]>(userKeys.lists(), (old) => {
        if (!old) return [];
        return old.filter((user) => user.id !== deletedId);
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Hook to get user by ID (for details view)
export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.fetchUserById(id),
    enabled: !!id,
  });
}