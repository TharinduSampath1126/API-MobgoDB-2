import express from 'express';
import multer from 'multer';
import { uploadImageToS3, deleteImageFromS3, extractS3KeyFromUrl } from '../utils/s3Upload.js';
import { uploadImageToCloudinary, deleteImageFromCloudinary, extractPublicIdFromUrl } from '../utils/cloudinaryUpload.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload product image to S3
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('📸 Product image upload to S3');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const uploadResult = await uploadImageToS3(req.file.buffer, req.file.originalname);

    if (uploadResult.success) {
      console.log('✅ S3 upload successful:', uploadResult.url);
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        url: uploadResult.url,
        key: uploadResult.key
      });
    } else {
      console.error('💥 S3 upload failed:', uploadResult.error);
      res.status(500).json({
        success: false,
        message: uploadResult.error || 'Failed to upload image'
      });
    }

  } catch (error) {
    console.error('💥 Image upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
});

// Upload user image to Cloudinary
router.post('/upload/user', upload.single('image'), async (req, res) => {
  try {
    console.log('📸 User image upload to Cloudinary');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const uploadResult = await uploadImageToCloudinary(req.file.buffer, req.file.originalname);

    if (uploadResult.success) {
      console.log('✅ Cloudinary upload successful:', uploadResult.url);
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        url: uploadResult.url,
        publicId: uploadResult.publicId
      });
    } else {
      console.error('💥 Cloudinary upload failed:', uploadResult.error);
      res.status(500).json({
        success: false,
        message: uploadResult.error || 'Failed to upload image'
      });
    }

  } catch (error) {
    console.error('💥 Image upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
});

// Delete image endpoint
router.delete('/delete', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    console.log('🗑️ Deleting image:', imageUrl);

    if (imageUrl.includes('amazonaws.com')) {
      const s3Key = extractS3KeyFromUrl(imageUrl);
      
      if (s3Key) {
        const deleteResult = await deleteImageFromS3(s3Key);
        
        if (deleteResult.success) {
          console.log('✅ S3 delete successful');
          res.json({
            success: true,
            message: 'Image deleted successfully'
          });
        } else {
          console.error('💥 S3 delete failed:', deleteResult.error);
          res.status(500).json({
            success: false,
            message: deleteResult.error || 'Failed to delete image'
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid S3 URL'
        });
      }
    } else if (imageUrl.includes('cloudinary.com')) {
      const publicId = extractPublicIdFromUrl(imageUrl);
      
      if (publicId) {
        const deleteResult = await deleteImageFromCloudinary(publicId);
        
        if (deleteResult.success) {
          console.log('✅ Cloudinary delete successful');
          res.json({
            success: true,
            message: 'Image deleted successfully'
          });
        } else {
          console.error('💥 Cloudinary delete failed:', deleteResult.error);
          res.status(500).json({
            success: false,
            message: deleteResult.error || 'Failed to delete image'
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid Cloudinary URL'
        });
      }
    } else {
      res.json({
        success: true,
        message: 'Base64 image, no deletion needed'
      });
    }

  } catch (error) {
    console.error('💥 Image deletion error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete image'
    });
  }
});

export default router;