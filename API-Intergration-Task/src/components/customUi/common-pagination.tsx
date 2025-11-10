import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CommonPaginationProps {
  /** Current page (0-based) */
  pageIndex: number
  /** Total number of pages */
  pageCount: number
  /** Can go to previous page */
  canPrevious?: boolean
  /** Can go to next page */
  canNext?: boolean
  /** Go to specific page (0-based) */
  onPageChange: (pageIndex: number) => void
  /** Go to previous page */
  onPreviousPage?: () => void
  /** Go to next page */
  onNextPage?: () => void
  /** Additional CSS classes */
  className?: string
  /** Show page jump input */
  showPageJump?: boolean
}

export function CommonPagination({
  pageIndex,
  pageCount,
  canPrevious = pageIndex > 0,
  canNext = pageIndex < pageCount - 1,
  onPageChange,
  onPreviousPage,
  onNextPage,
  className,
  showPageJump = true,
}: CommonPaginationProps) {
  const handleFirstPage = () => onPageChange(0)
  const handleLastPage = () => onPageChange(pageCount - 1)
  const handlePreviousPage = () => onPreviousPage ? onPreviousPage() : onPageChange(pageIndex - 1)
  const handleNextPage = () => onNextPage ? onNextPage() : onPageChange(pageIndex + 1)

  const handlePageJump = (value: string) => {
    const page = Number(value)
    if (!Number.isNaN(page) && page >= 1 && page <= pageCount) {
      onPageChange(page - 1) // convert to 0-based
    }
  }

  return (
    <div className={cn('flex items-center justify-between px-2', className)}>
      <div className="flex items-center space-x-6 lg:space-x-8">
        {showPageJump && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Page</span>
            <Input
              aria-label="Go to page"
              className="w-16 h-8"
              value={String(pageIndex + 1)}
              onChange={(e) => handlePageJump(e.target.value)}
              onBlur={(e) => handlePageJump(e.target.value)}
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
            onClick={handleFirstPage}
            disabled={!canPrevious}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={handlePreviousPage}
            disabled={!canPrevious}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={handleNextPage}
            disabled={!canNext}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={handleLastPage}
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