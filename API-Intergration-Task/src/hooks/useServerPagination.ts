import { useState, useEffect, useCallback } from 'react';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UseServerPaginationProps {
  endpoint: string;
  initialLimit?: number;
  searchQuery?: string;
}

interface UseServerPaginationReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: PaginationData;
  fetchData: (page?: number) => Promise<void>;
  setLimit: (limit: number) => void;
  refresh: () => Promise<void>;
}

export function useServerPagination<T>({
  endpoint,
  initialLimit = 10,
  searchQuery = ''
}: UseServerPaginationProps): UseServerPaginationReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: initialLimit,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery })
      });
      
      const response = await fetch(`${endpoint}?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.users || result.data || []);
        setPagination(result.pagination);
      } else {
        setError(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [endpoint, pagination.limit, searchQuery]);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit }));
    fetchData(1); // Reset to first page when changing limit
  }, [fetchData]);

  const refresh = useCallback(() => {
    return fetchData(pagination.page);
  }, [fetchData, pagination.page]);

  useEffect(() => {
    fetchData(1);
  }, [searchQuery]); // Refetch when search changes

  return {
    data,
    loading,
    error,
    pagination,
    fetchData,
    setLimit,
    refresh
  };
}