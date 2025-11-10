// useAppTable.ts
import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";

export function useAppTable<TData>(data: TData[], columns: ColumnDef<TData, any>[]) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const memoData = useMemo(() => data, [data]);
  const memoCols = useMemo(() => columns, [columns]);

  const table = useReactTable({
    data: memoData,
    columns: memoCols,
    // set a sensible default pagination state so controls work immediately
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
  });

  return { table, sorting, columnFilters, columnVisibility, setSorting, setColumnFilters, setColumnVisibility };
}
