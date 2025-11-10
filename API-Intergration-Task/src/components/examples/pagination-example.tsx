import { useState } from 'react';
import { CommonPagination } from '@/components/customUi/common-pagination';
import { usePagination } from '@/hooks/usePagination';

// Example data - you can replace this with any data source
const sampleData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  description: `Description for item ${i + 1}`,
}));

export function PaginationExample() {
  const [data] = useState(sampleData);
  const [pageSize, setPageSize] = useState(10);

  const {
    currentData,
    pageIndex,
    pageCount,
    canPrevious,
    canNext,
    goToPage,
    nextPage,
    previousPage,
    setPageSize: updatePageSize,
    totalItems,
  } = usePagination({
    data,
    pageSize,
  });

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    updatePageSize(newSize);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pagination Example</h2>
      
      {/* Page size selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Items per page:</span>
        <select
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Data display */}
      <div className="border rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {currentData.map((item) => (
            <div key={item.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
        
        {currentData.length === 0 && (
          <div className="p-8 text-center text-gray-500">No data available</div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, totalItems)} of {totalItems} items
        </div>
        
        <CommonPagination
          pageIndex={pageIndex}
          pageCount={pageCount}
          canPrevious={canPrevious}
          canNext={canNext}
          onPageChange={goToPage}
          onPreviousPage={previousPage}
          onNextPage={nextPage}
          showPageJump={true}
        />
      </div>
    </div>
  );
}