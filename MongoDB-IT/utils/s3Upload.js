import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// S3 client configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Generate unique filename
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `profile-images/${timestamp}-${randomString}.${extension}`;
};

// Upload file to S3
export const uploadImageToS3 = async (file, originalName) => {
  try {
    console.log('🔧 S3 Upload Configuration:');
    console.log('- Region:', process.env.AWS_REGION);
    console.log('- Bucket:', process.env.AWS_BUCKET_NAME);
    console.log('- Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? 'Present' : 'Missing');
    console.log('- Secret Key:', process.env.AWS_SECRET_ACCESS_KEY ? 'Present' : 'Missing');
    
    const key = generateUniqueFileName(originalName);
    console.log('📁 Generated S3 key:', key);

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: 'image/*',
      // Removed ACL since bucket doesn't support it
    });

    console.log('🚀 Sending to S3...');
    await s3Client.send(command);
    console.log('✅ S3 upload successful');

    // Generate public URL
    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    console.log('🔗 Generated URL:', url);

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error('💥 S3 upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload image to S3',
    };
  }
};

// Delete file from S3
export const deleteImageFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error('S3 delete error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete image from S3',
    };
  }
};

// Extract S3 key from URL
export const extractS3KeyFromUrl = (url) => {
  try {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const s3BaseUrl = `https://${bucketName}.s3.${region}.amazonaws.com/`;
    
    if (url && url.startsWith(s3BaseUrl)) {
      return url.replace(s3BaseUrl, '');
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting S3 key:', error);
    return null;
  }
};

// Get public URL from S3 key
export const getS3PublicUrl = (key) => {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};