import { columns, viewOnlyColumns, User } from '@/components/data-table/columns';
import { DataTable } from '@/components/data-table/data-table';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  data: User[];
  onTableChange?: (table: any) => void;
  readOnly?: boolean;
};

export default function UsersTable({ data, onTableChange, readOnly = false }: Props) {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  
  return (
    <DataTable
      columns={isStudent ? viewOnlyColumns : columns}
      data={data}
      onTableChange={onTableChange}
      readOnly={readOnly}
      // Column customization props
      
      columnOrder={isStudent ? ['id', 'firstName', 'lastName', 'email', 'phone', 'birthDate','age', 'view'] : ['id', 'firstName', 'lastName', 'email', 'phone', 'birthDate','age', 'actions']}
      columnWidths={{
        'id': 60,
        'firstName': 120,
        'lastName': 120,
        'email': 200,
        'phone': 140,
        'birthDate': 120,
        'actions': 120,
        'view': 80
      }}
      columnHeaders={{
        'firstName': 'firstName',
        'lastName': 'lastName',
        'email': 'email',
        'phone': 'phone',
        'birthDate': 'birthDate',
        'age': 'age',
        'actions': 'actions'
      }}
      // Visual customization props
      striped={true}
      hoverable={true}
      size="md"
      border={true}
      rounded={true}
      showSuccessAlert={true}
      emptyMessage="No users found."
      className="mt-4"
      tableClassName="min-w-full"
    />
  );
}
