import React from 'react';
import { ColumnDef, flexRender } from '@tanstack/react-table';
import { useAppTable } from '@/hooks/useAppTable';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import SuccessAlert from '@/components/customUi/success-alert';
import { usePostStore } from '@/store/postStore';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onAddData?: (newData: any) => void;
  onTableChange?: (table: any) => void;
  
  // Column customization props
  hiddenColumns?: string[]; // Array of column IDs to hide
  columnOrder?: string[]; // Array of column IDs in desired order
  customColumns?: ColumnDef<TData, TValue>[]; // Override default columns completely
  columnWidths?: Record<string, number>; // Custom column widths
  columnHeaders?: Record<string, string>; // Custom column header names
  
  // Visual customization props
  className?: string;
  tableClassName?: string;
  showSuccessAlert?: boolean;
  emptyMessage?: string;
  containerClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  border?: boolean;
  rounded?: boolean;
  size?: 'sm' | 'md' | 'lg';
  striped?: boolean;
  hoverable?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onTableChange,
  
  // Column customization props
  hiddenColumns = [],
  columnOrder = [],
  customColumns,
  columnWidths = {},
  columnHeaders = {},
  
  // Visual customization props
  className = '',
  tableClassName = '',
  showSuccessAlert = true,
  emptyMessage = 'No results.',
  containerClassName = '',
  headerClassName = '',
  rowClassName = '',
  cellClassName = '',
  border = true,
  rounded = true,
  size = 'md',
  striped = false,
  hoverable = false,
}: DataTableProps<TData, TValue>) {
  const lastDeleted = usePostStore((s) => s.lastDeleted);
  const clearLastDeleted = usePostStore((s) => s.clearLastDeleted);

  // Process columns based on customization props
  const processedColumns = React.useMemo(() => {
    // Use custom columns if provided, otherwise use default columns
    let workingColumns = customColumns || columns;

    // Apply column widths if specified
    if (Object.keys(columnWidths).length > 0) {
      workingColumns = workingColumns.map(col => {
        const colId = ('accessorKey' in col && col.accessorKey) || col.id;
        const colIdStr = typeof colId === 'string' ? colId : String(colId);
        if (colIdStr && columnWidths[colIdStr]) {
          return {
            ...col,
            size: columnWidths[colIdStr],
          };
        }
        return col;
      });
    }

    // Apply custom column headers if specified
    if (Object.keys(columnHeaders).length > 0) {
      workingColumns = workingColumns.map(col => {
        const colId = ('accessorKey' in col && col.accessorKey) || col.id;
        const colIdStr = typeof colId === 'string' ? colId : String(colId);
        if (colIdStr && columnHeaders[colIdStr]) {
          return {
            ...col,
            header: columnHeaders[colIdStr],
          };
        }
        return col;
      });
    }

    // Filter out hidden columns
    if (hiddenColumns.length > 0) {
      workingColumns = workingColumns.filter(col => {
        const colId = ('accessorKey' in col && col.accessorKey) || col.id;
        const colIdStr = typeof colId === 'string' ? colId : String(colId);
        return colIdStr ? !hiddenColumns.includes(colIdStr) : true;
      });
    }

    // Reorder columns if columnOrder is specified
    if (columnOrder.length > 0) {
      const orderedColumns: ColumnDef<TData, TValue>[] = [];
      const columnMap = new Map<string, ColumnDef<TData, TValue>>();
      
      // Create a map of columns by their ID
      workingColumns.forEach(col => {
        const colId = ('accessorKey' in col && col.accessorKey) || col.id;
        const colIdStr = typeof colId === 'string' ? colId : String(colId);
        if (colIdStr) {
          columnMap.set(colIdStr, col);
        }
      });

      // Add columns in the specified order
      columnOrder.forEach(colId => {
        const column = columnMap.get(colId);
        if (column) {
          orderedColumns.push(column);
          columnMap.delete(colId);
        }
      });

      // Add any remaining columns that weren't in the order array
      columnMap.forEach(col => orderedColumns.push(col));
      
      workingColumns = orderedColumns;
    }

    return workingColumns;
  }, [columns, customColumns, hiddenColumns, columnOrder, columnWidths, columnHeaders]);

  const { table, columnFilters, setColumnFilters, columnVisibility, setColumnVisibility } = useAppTable(data, processedColumns);

  // expose a small reactive API to parent so external pagination controls
  // receive updates only when relevant table state changes. We memoize
  // the API and only call the parent's setter when the memoized object
  // changes to avoid infinite update loops.
  const api = React.useMemo(() => {
    return {
      table,
      pageIndex: table.getState().pagination.pageIndex,
      pageSize: table.getState().pagination.pageSize,
      pageCount: table.getPageCount(),
      canPrevious: table.getCanPreviousPage(),
      canNext: table.getCanNextPage(),
      setPageSize: (s: number) => table.setPageSize(s),
      setPageIndex: (i: number) => table.setPageIndex(i),
      previousPage: () => table.previousPage(),
      nextPage: () => table.nextPage(),
  // expose column filters and visibility so parents re-render when they change
  columnFilters,
  setColumnFilters,
  columnVisibility,
  setColumnVisibility,
    };
    // include the primitive values/readers used above as dependencies so
    // the memo updates only when these change.
  }, [
    table,
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize,
    table.getPageCount(),
    table.getCanPreviousPage(),
    table.getCanNextPage(),
    // re-run memo when columnFilters OR columnVisibility change so external
    // controls (filter inputs and column visibility dropdown) update
    columnFilters,
    columnVisibility,
  ]);

  React.useEffect(() => {
    if (typeof onTableChange === 'function') {
      onTableChange(api);
    }
  }, [onTableChange, api]);

  // Generate dynamic classes based on props
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'lg': return 'text-lg';
      default: return '';
    }
  };

  const getTableClasses = () => {
    const classes = ['w-full', 'min-w-full'];
    if (striped) classes.push('[&_tbody_tr:nth-child(even)]:bg-gray-50');
    if (hoverable) classes.push('[&_tbody_tr]:hover:bg-gray-100');
    return classes.join(' ');
  };

  const getContainerClasses = () => {
    const classes = ['w-full', 'overflow-x-auto'];
    if (border) classes.push('border');
    if (rounded) classes.push('rounded-md');
    return classes.join(' ');
  };

  

  return (
    <div className={className}>
      {showSuccessAlert && (
        <SuccessAlert
          open={Boolean(lastDeleted)}
          onOpenChange={(v) => {
            if (!v) clearLastDeleted?.();
          }}
          title="Deleted"
          message={lastDeleted ? `${lastDeleted.firstName} ${lastDeleted.lastName} was deleted successfully.` : undefined}
        />
      )}

      <div className={`${getContainerClasses()} ${containerClassName}`}>
        <Table className={`${getTableClasses()} ${getSizeClasses()} ${tableClassName}`}>
          <TableHeader className={headerClassName}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={rowClassName}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cellClassName}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={processedColumns.length}
                  className={`h-24 text-center ${cellClassName}`}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default DataTable;
