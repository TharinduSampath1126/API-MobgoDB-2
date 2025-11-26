// Image upload utility functions - Backend upload approach
export interface ImageUploadResult {
  success: boolean;
  dataUrl?: string;
  url?: string;
  key?: string;
  error?: string;
}

// Validate image file
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' };
  }

  return { valid: true };
};

// Upload image via backend API (more reliable than direct S3)
export const uploadImageToS3Handler = async (file: File): Promise<ImageUploadResult> => {
  try {
    const validation = validateImage(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Create FormData to send file to backend
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/images/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        url: result.url,
        key: result.key,
      };
    } else {
      return {
        success: false,
        error: result.message || 'Failed to upload image',
      };
    }
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error during upload',
    };
  }
};

// Convert image to base64 data URL (fallback method)
export const imageToDataUrl = (file: File): Promise<ImageUploadResult> => {
  return new Promise((resolve) => {
    // Validate file first
    const validation = validateImage(file);
    if (!validation.valid) {
      resolve({ success: false, error: validation.error });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        success: true,
        dataUrl: reader.result as string,
      });
    };
    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read file',
      });
    };
    reader.readAsDataURL(file);
  });
};

// Main upload handler that tries S3 first, falls back to base64
export const handleImageUpload = async (file: File): Promise<ImageUploadResult> => {
  try {
    // Try S3 upload first
    const s3Result = await uploadImageToS3Handler(file);
    
    if (s3Result.success) {
      console.log('✅ S3 upload successful:', s3Result.url);
      return s3Result;
    }
    
    console.log('⚠️ S3 upload failed, using base64 fallback:', s3Result.error);
    
    // Fallback to base64 if S3 fails
    const base64Result = await imageToDataUrl(file);
    return base64Result;
    
  } catch (error) {
    console.error('💥 Image upload error:', error);
    
    // Final fallback to base64
    try {
      const base64Result = await imageToDataUrl(file);
      return base64Result;
    } catch (fallbackError) {
      return {
        success: false,
        error: 'Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }
};

// Delete image from S3 (if needed)
export const deleteImageFromS3 = async (imageUrl: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Only attempt deletion for S3 URLs
    if (!imageUrl.includes('amazonaws.com')) {
      return { success: true }; // Base64 images don't need deletion
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/images/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image',
    };
  }
};