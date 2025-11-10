import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  /** Array of data to paginate */
  data: T[]
  /** Number of items per page */
  pageSize?: number
  /** Initial page (0-based) */
  initialPage?: number
}

interface UsePaginationReturn<T> {
  /** Current page data */
  currentData: T[]
  /** Current page index (0-based) */
  pageIndex: number
  /** Total number of pages */
  pageCount: number
  /** Can go to previous page */
  canPrevious: boolean
  /** Can go to next page */
  canNext: boolean
  /** Go to specific page (0-based) */
  goToPage: (page: number) => void
  /** Go to next page */
  nextPage: () => void
  /** Go to previous page */
  previousPage: () => void
  /** Change page size */
  setPageSize: (size: number) => void
  /** Current page size */
  currentPageSize: number
  /** Total number of items */
  totalItems: number
}

export function usePagination<T>({
  data,
  pageSize = 10,
  initialPage = 0,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [pageIndex, setPageIndex] = useState(initialPage);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const pageCount = Math.ceil(data.length / currentPageSize);
  const canPrevious = pageIndex > 0;
  const canNext = pageIndex < pageCount - 1;

  const currentData = useMemo(() => {
    const startIndex = pageIndex * currentPageSize;
    return data.slice(startIndex, startIndex + currentPageSize);
  }, [data, pageIndex, currentPageSize]);

  const goToPage = (page: number) => {
    const validPage = Math.max(0, Math.min(page, pageCount - 1));
    setPageIndex(validPage);
  };

  const nextPage = () => {
    if (canNext) {
      setPageIndex(pageIndex + 1);
    }
  };

  const previousPage = () => {
    if (canPrevious) {
      setPageIndex(pageIndex - 1);
    }
  };

  const setPageSize = (size: number) => {
    setCurrentPageSize(size);
    // Reset to first page when changing page size
    setPageIndex(0);
  };

  return {
    currentData,
    pageIndex,
    pageCount: Math.max(1, pageCount), // At least 1 page
    canPrevious,
    canNext,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    currentPageSize,
    totalItems: data.length,
  };
}