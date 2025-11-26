import * as React from 'react';
import { format } from 'date-fns';
import { Upload, X, ImageIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/phone-input';
import { BirthDateAgePicker } from '@/components/ui/birth-date-age-picker';
import { UserSchema, User } from '@/components/data-table/columns';
import { handleImageUpload, deleteImageFromS3 } from '@/utils/upload';

type Props = {
	initialData?: User;
	isEdit?: boolean;
	nextId?: number;
	onSubmit: (data: User) => Promise<void> | void;
	onOpenChange?: (open: boolean) => void;
};

export function CustomForm({ initialData, isEdit, nextId, onSubmit, onOpenChange }: Props) {
	const [birthDate, setBirthDate] = React.useState<Date | undefined>(
		initialData ? (initialData.birthDate ? new Date(initialData.birthDate) : undefined) : undefined
	);
	const [age, setAge] = React.useState<number | undefined>(initialData?.age);
	const [phone, setPhone] = React.useState<string>(initialData?.phone ?? '');
	const [errors, setErrors] = React.useState<Record<string, string>>({});

	// Image upload states
	const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
	const [imagePreview, setImagePreview] = React.useState<string | null>(initialData?.profileImage || null);
	const [isUploading, setIsUploading] = React.useState(false);
	const [imageUploadError, setImageUploadError] = React.useState<string | null>(null);

	// Auto-generated ID for new users
	const autoId = React.useMemo(() => {
		return isEdit ? initialData?.id : (nextId || 1);
	}, [isEdit, initialData?.id, nextId]);

	// helper to clear a specific field error when the field changes
	const clearFieldError = (field: string) => {
		setErrors((prev) => {
			const next = { ...prev };
			delete (next as any)[field];
			return next;
		});
	};

	// Handle image selection
	const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedImage(file);
			setImageUploadError(null);
			
			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	// Remove image
	const handleRemoveImage = () => {
		setSelectedImage(null);
		setImagePreview(null);
		setImageUploadError(null);
		
		// Reset file input
		const fileInput = document.getElementById('image-upload') as HTMLInputElement;
		if (fileInput) {
			fileInput.value = '';
		}
	};

	return (
		<form
				onSubmit={async (e) => {
					e.preventDefault();
					setIsUploading(true);
					setImageUploadError(null);
					
					try {
						const formData = new FormData(e.target as HTMLFormElement);
						const birthDateStr = birthDate ? format(birthDate, 'yyyy-MM-dd') : '';

						// Use auto-generated ID for new users, form ID for edits
						const rawId = Number(formData.get('id'));
						const finalId = isEdit 
							? (rawId || initialData?.id || 1)
							: autoId;

						let imageUrl = initialData?.profileImage || null;

						// Handle image upload if new image selected
						if (selectedImage) {
							console.log('🖼️ Uploading image to AWS S3...');
							const uploadResult = await handleImageUpload(selectedImage);
							
							if (uploadResult.success) {
								imageUrl = uploadResult.url || uploadResult.dataUrl || null;
								console.log('✅ Image upload successful:', imageUrl);
							} else {
								console.error('❌ Image upload failed:', uploadResult.error);
								setImageUploadError(uploadResult.error || 'Failed to upload image');
								setIsUploading(false);
								return;
							}
						}

						const rawData = {
							id: finalId,
							firstName: (formData.get('firstName') as string) ?? '',
							lastName: (formData.get('lastName') as string) ?? '',
							age: age || 0,
							email: (formData.get('email') as string) ?? '',
							phone: phone,
							birthDate: birthDateStr,
							profileImage: imageUrl,
						} as unknown as User;

						console.log('Form data being submitted:', rawData);
						console.log('Auto-generated ID:', autoId, 'Final ID used:', finalId);
						console.log('Is editing?', isEdit, 'Initial data ID:', initialData?.id);

				try {
					const validatedData = UserSchema.parse(rawData);
					console.log('Validated data to be saved:', validatedData);
					await Promise.resolve(onSubmit(validatedData));
					console.log('User successfully saved with ID:', validatedData.id);
					
					// Reset form
					(e.target as HTMLFormElement).reset();
					setBirthDate(undefined);
					setAge(undefined);
					setPhone('');
					setSelectedImage(null);
					setImagePreview(null);
					setImageUploadError(null);
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
				} finally {
					setIsUploading(false);
				}
			} catch (error: any) {
				console.error('Form submission error:', error);
				setIsUploading(false);
				setImageUploadError('Failed to submit form: ' + (error.message || 'Unknown error'));
			}
			}}
			className="space-y-4"
		>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="sm:col-span-2">
					<label className="mb-1 block text-sm font-medium">
						ID {!isEdit && <span className="text-green-600 font-semibold">(Auto-generated: {autoId})</span>}
					</label>
					{!isEdit && (
						<div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-md">
							<div className="flex items-center space-x-2">
								<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
								<span className="text-sm text-green-700">
									Next available ID: <span className="font-bold text-green-800">{autoId}</span>
								</span>
							</div>
						</div>
					)}
					<Input
						name="id"
						type="number"
						placeholder="Auto-generated ID"
						error={errors.id}
						onChange={() => clearFieldError('id')}
						value={autoId}
						readOnly={!isEdit}
						className={!isEdit ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}
					/>
				</div>

				{/* Image Upload Field */}
				<div className="sm:col-span-2">
					<label className="mb-2 block text-sm font-medium">Profile Image</label>
					
					{/* Image Preview */}
					{imagePreview && (
						<div className="mb-4 relative inline-block">
							<img
								src={imagePreview}
								alt="Profile Preview"
								className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-md"
							/>
							<button
								type="button"
								onClick={handleRemoveImage}
								className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					)}
					
					{/* Upload Button */}
					<div className="flex items-center gap-4">
						<label
							htmlFor="image-upload"
							className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Upload className="w-4 h-4 mr-2" />
							{isUploading ? 'Uploading...' : (imagePreview ? 'Change Image' : 'Upload Image')}
						</label>
						<input
							id="image-upload"
							type="file"
							accept="image/*"
							onChange={handleImageSelect}
							className="hidden"
							disabled={isUploading}
						/>
						{!imagePreview && (
							<div className="flex items-center text-gray-400">
								<ImageIcon className="w-5 h-5 mr-2" />
								<span className="text-sm">No image selected</span>
							</div>
						)}
					</div>
					
					{/* Upload Error */}
					{imageUploadError && (
						<div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
							<p className="text-sm text-red-600">{imageUploadError}</p>
						</div>
					)}
					
					{/* Upload Info */}
					<p className="mt-2 text-xs text-gray-500">
						Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB. Images will be uploaded to AWS S3.
					</p>
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
