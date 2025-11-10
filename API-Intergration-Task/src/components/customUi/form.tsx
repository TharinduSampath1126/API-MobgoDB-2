import * as React from 'react';
import { format } from 'date-fns';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/phone-input';
import { BirthDateAgePicker } from '@/components/ui/birth-date-age-picker';
import { UserSchema, User } from '@/components/data-table/columns';

type Props = {
	initialData?: User;
	isEdit?: boolean;
	onSubmit: (data: User) => Promise<void> | void;
	onOpenChange?: (open: boolean) => void;
};

export function CustomForm({ initialData, isEdit, onSubmit, onOpenChange }: Props) {
	const [birthDate, setBirthDate] = React.useState<Date | undefined>(
		initialData ? (initialData.birthDate ? new Date(initialData.birthDate) : undefined) : undefined
	);
	const [age, setAge] = React.useState<number | undefined>(initialData?.age);
	const [phone, setPhone] = React.useState<string>(initialData?.phone ?? '');
	const [errors, setErrors] = React.useState<Record<string, string>>({});

	// helper to clear a specific field error when the field changes
	const clearFieldError = (field: string) => {
		setErrors((prev) => {
			const next = { ...prev };
			delete (next as any)[field];
			return next;
		});
	};

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				const formData = new FormData(e.target as HTMLFormElement);
				const birthDateStr = birthDate ? format(birthDate, 'yyyy-MM-dd') : '';

				const rawId = Number(formData.get('id'));
				// Generate a random ID between 1 and 10000 if no ID provided
				const finalId = !rawId || Number.isNaN(rawId) ? (initialData?.id ?? Math.floor(Math.random() * 10000) + 1) : rawId;

				const rawData = {
					id: finalId,
					firstName: (formData.get('firstName') as string) ?? '',
					lastName: (formData.get('lastName') as string) ?? '',
					age: age || 0,
					email: (formData.get('email') as string) ?? '',
					phone: phone,
					birthDate: birthDateStr,
				} as unknown as User;

				console.log('Form data being submitted:', rawData);

				try {
					const validatedData = UserSchema.parse(rawData);
					console.log('Validated data:', validatedData);
					await Promise.resolve(onSubmit(validatedData));
					(e.target as HTMLFormElement).reset();
					setBirthDate(undefined);
					setAge(undefined);
					setPhone('');
					setErrors({});
					onOpenChange?.(false);
				} catch (error: any) {
					const fieldErrors: Record<string, string> = {};
					if (error?.issues) {
						error.issues.forEach((err: any) => {
							fieldErrors[err.path?.[0]] = err.message;
						});
					}
					setErrors(fieldErrors);
				}
			}}
			className="space-y-4"
		>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="sm:col-span-2">
					<label className="mb-1 block text-sm font-medium">ID</label>
					<Input
						name="id"
						type="number"
						placeholder="Enter ID"
						error={errors.id}
						onChange={() => clearFieldError('id')}
						defaultValue={initialData?.id}
						disabled={isEdit}
						className={isEdit ? 'bg-gray-50' : ''}
					/>
					
				</div>

				<div>
					<label className="mb-1 block text-sm font-medium">First Name</label>
					<Input
						name="firstName"
						placeholder="Enter First Name"
						error={errors.firstName}
						onChange={() => clearFieldError('firstName')}
						defaultValue={initialData?.firstName}
					/>
					
				</div>

				<div>
					<label className="mb-1 block text-sm font-medium">Last Name</label>
					<Input
						name="lastName"
						placeholder="Enter Last Name"
						error={errors.lastName}
						onChange={() => clearFieldError('lastName')}
						defaultValue={initialData?.lastName}
					/>
					
				</div>

				<div className="sm:col-span-2">
					<label className="mb-1 block text-sm font-medium">Email</label>
					<Input
						name="email"
						type="email"
						placeholder="Enter Email"
						error={errors.email}
						onChange={() => clearFieldError('email')}
						defaultValue={initialData?.email}
					/>
					
				</div>

				<div className="sm:col-span-2">
					<label className="mb-1 block text-sm font-medium">Phone</label>
					<PhoneInput
						value={phone}
						onChange={(v) => {
							setPhone(v);
							clearFieldError('phone');
						}}
						placeholder="Enter phone number"
						error={errors.phone}
					/>
					
				</div>

				<div className="sm:col-span-2">
					<BirthDateAgePicker
						birthDate={birthDate}
						onBirthDateChange={(d) => {
							setBirthDate(d);
							clearFieldError('birthDate');
							// also clear age error when birth date changes
							clearFieldError('age');
						}}
						onAgeChange={(a) => {
							setAge(a);
							clearFieldError('age');
						}}
						birthDateError={errors.birthDate}
						ageError={errors.age}
						className="space-y-4"
					/>
					
				</div>
			</div>

			<div className="flex items-center gap-2">
				<Button type="submit" className="flex-1">
					{isEdit ? 'Update User' : 'Add User'}
				</Button>
				<Button
					type="button"
					variant="ghost"
					className="w-32"
					onClick={() => {
						onOpenChange?.(false);
					}}
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}

export default CustomForm;
