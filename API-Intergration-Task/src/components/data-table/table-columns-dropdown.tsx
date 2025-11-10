import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Props = {
  // TanStack table instance or wrapper object that may contain `table`
  table?: any;
  // Alternatively, a simple columns array and a toggle callback can be provided
  columns?: { id: string; label?: string; isVisible?: boolean }[];
  onToggleColumn?: (id: string, visible: boolean) => void;
};

export function TableColumnsDropdown({ table, columns, onToggleColumn }: Props) {
  // support both the raw TanStack table instance and the wrapper API
  // object we sometimes pass from parent (which may contain a `table` field)
  const realTable = table?.table ?? table;

  // If a table is provided, use its columns and visibility API.
  // Otherwise, fall back to the provided columns + onToggleColumn callback.
  const allColumnsFromTable = (realTable?.getAllColumns?.() ?? []).filter(
    (column: any) => column.getCanHide?.()
  );

  const usingTable = !!realTable && allColumnsFromTable.length > 0;

  const dropdownDisabled = !usingTable && !(columns && columns.length > 0 && onToggleColumn);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto" disabled={dropdownDisabled}>
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {usingTable
          ? allColumnsFromTable.map((column: any) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible?.()}
                  onCheckedChange={(value: any) => column.toggleVisibility?.(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })
          : (columns ?? []).map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                className="capitalize"
                checked={!!col.isVisible}
                onCheckedChange={(value: any) => onToggleColumn?.(col.id, !!value)}
              >
                {col.label ?? col.id}
              </DropdownMenuCheckboxItem>
            ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TableColumnsDropdown;
