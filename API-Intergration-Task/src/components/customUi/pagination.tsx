import { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DataTablePaginationProps<TData> {
  // accepts either the TanStack Table or the lightweight API object
  table?: Table<TData> | null | any
  // OR provide pagination props directly (like CommonPagination)
  pageIndex?: number
  pageCount?: number
  canPrevious?: boolean
  canNext?: boolean
  onPageChange?: (pageIndex: number) => void
  onPreviousPage?: () => void
  onNextPage?: () => void
  showPageJump?: boolean
  className?: string
  // OR provide data directly for automatic pagination
  data?: TData[]
  pageSize?: number
}

export function DataTablePagination<TData>({
  table,
  pageIndex: pageIndexProp,
  pageCount: pageCountProp,
  canPrevious: canPreviousProp,
  canNext: canNextProp,
  onPageChange,
  onPreviousPage,
  onNextPage,
  showPageJump = false,
  className,
  data,
  pageSize: pageSizeProp,
}: DataTablePaginationProps<TData>) {
  // Support both the raw TanStack `table` instance and the wrapper API
  // we pass from DataTable. This keeps external controls reactive.
  let pageIndex = 0
  let pageCount = 0
  let canPrevious = false
  let canNext = false
  let setPageIndex: ((i: number) => void) | undefined
  let previous: (() => void) | undefined
  let next: (() => void) | undefined

  // If data is provided directly, calculate pagination info
  if (data && pageSizeProp && pageIndexProp !== undefined && onPageChange) {
    const totalItems = data.length
    const calculatedPageCount = Math.ceil(totalItems / pageSizeProp)
    
    pageIndex = pageIndexProp
    pageCount = calculatedPageCount
    canPrevious = pageIndexProp > 0
    canNext = pageIndexProp < calculatedPageCount - 1
    setPageIndex = onPageChange
    previous = onPreviousPage || (() => onPageChange(pageIndexProp - 1))
    next = onNextPage || (() => onPageChange(pageIndexProp + 1))
  }
  // If direct props are provided, use them instead of table
  else if (pageIndexProp !== undefined && pageCountProp !== undefined && onPageChange) {
    pageIndex = pageIndexProp
    pageCount = pageCountProp
    canPrevious = canPreviousProp ?? pageIndex > 0
    canNext = canNextProp ?? pageIndex < pageCount - 1
    setPageIndex = onPageChange
    previous = onPreviousPage || (() => onPageChange(pageIndex - 1))
    next = onNextPage || (() => onPageChange(pageIndex + 1))
  } else if (!table) {
    // keep defaults
  } else if (typeof table.getState === 'function') {
    pageIndex = table.getState().pagination.pageIndex
    pageCount = table.getPageCount()
    canPrevious = table.getCanPreviousPage()
    canNext = table.getCanNextPage()
    setPageIndex = (i: number) => table.setPageIndex(i)
    previous = () => table.previousPage()
    next = () => table.nextPage()
  } else {
    // assume wrapper: { pageIndex, pageSize, pageCount, canPrevious, canNext, setPageSize, setPageIndex, previousPage, nextPage }
    pageIndex = table.pageIndex ?? 0
    pageCount = table.pageCount ?? 0
    canPrevious = table.canPrevious ?? false
    canNext = table.canNext ?? false
    setPageIndex = table.setPageIndex
    previous = table.previousPage
    next = table.nextPage
  }

  return (
    <div className={cn("flex items-center justify-between px-2", className)}>
      {/* <div className="text-muted-foreground flex-1 text-sm">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div> */}
      <div className="flex items-center space-x-6 lg:space-x-8">
        {showPageJump && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Page</span>
            <Input
              aria-label="Go to page"
              className="w-16 h-8"
              value={String(pageIndex + 1)}
              onChange={(e) => {
                const page = Number(e.target.value)
                if (!Number.isNaN(page) && page >= 1 && page <= pageCount && setPageIndex) {
                  setPageIndex(page - 1) // convert to 0-based
                }
              }}
              onBlur={(e) => {
                const page = Number(e.target.value)
                if (!Number.isNaN(page) && page >= 1 && page <= pageCount && setPageIndex) {
                  setPageIndex(page - 1) // convert to 0-based
                }
              }}
            />
            <span className="text-sm text-muted-foreground">of {pageCount}</span>
          </div>
        )}
        
        {!showPageJump && (
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {pageIndex + 1} of {pageCount}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => setPageIndex?.(0)}
            disabled={!canPrevious}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => previous?.()}
            disabled={!canPrevious}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => next?.()}
            disabled={!canNext}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => setPageIndex?.((pageCount || 1) - 1)}
            disabled={!canNext}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
