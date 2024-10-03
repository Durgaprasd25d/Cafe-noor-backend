import express from 'express';
import cloudinary from '../utils/cloudinary.js';
import upload from '../middleware/multer.js';

const router = express.Router();

router.post('/upload', upload.single('image'), (req, res) => {
  cloudinary.uploader.upload(req.file.path, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: 'Error',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Uploaded!',
      data: result,
    });
  });
});

export default router;
