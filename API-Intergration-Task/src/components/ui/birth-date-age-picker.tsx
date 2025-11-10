import * as React from 'react';
import { DatePicker } from './date-picker';
import { Input } from './input';

interface BirthDateAgePickerProps {
  birthDate?: Date;
  onBirthDateChange?: (date: Date | undefined) => void;
  onAgeChange?: (age: number | undefined) => void;
  birthDateError?: string;
  ageError?: string;
  className?: string;
}

export function BirthDateAgePicker({
  birthDate,
  onBirthDateChange,
  onAgeChange,
  birthDateError,
  ageError,
  className,
}: BirthDateAgePickerProps) {
  const [age, setAge] = React.useState<number>();

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleBirthDateChange = (date: Date | undefined) => {
    onBirthDateChange?.(date);
    if (date) {
      const calculatedAge = calculateAge(date);
      setAge(calculatedAge);
      onAgeChange?.(calculatedAge);
    } else {
      setAge(undefined);
      onAgeChange?.(undefined);
    }
  };

  // initialize age when a birthDate prop is provided (e.g., edit form)
  React.useEffect(() => {
    if (birthDate) {
      const calculatedAge = calculateAge(birthDate);
      setAge(calculatedAge);
      onAgeChange?.(calculatedAge);
    } else {
      setAge(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birthDate]);

  return (
    <div className={className}>
      <div>
        <label className="mb-1 block text-sm font-medium">Birth Date</label>
        <DatePicker
          date={birthDate}
          onDateChange={handleBirthDateChange}
          placeholder="Select birth date"
          className={birthDateError ? 'border-red-500' : ''}
        />
        {birthDateError && (
          <p className="mt-1 text-sm text-red-500">{birthDateError}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Age</label>
        <Input
          type="number"
          value={age || ''}
          placeholder="Age will be calculated"
          readOnly
          className={`bg-gray-50 ${ageError ? 'border-red-500' : ''}`}
        />
        {ageError && <p className="mt-1 text-sm text-red-500">{ageError}</p>}
      </div>
    </div>
  );
}
