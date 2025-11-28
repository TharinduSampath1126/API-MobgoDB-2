import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = async (buffer, filename) => {
  try {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        {
          resource_type: 'auto',
          public_id: filename.split('.')[0],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              success: true,
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        }
      );
      stream.end(buffer);
    });
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      error: result.result !== 'ok' ? 'Failed to delete image' : null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const extractPublicIdFromUrl = (url) => {
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  } catch {
    return null;
  }
};