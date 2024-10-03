import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config(); // Ensure dotenv is configured here if it's a separate file

// Configure Cloudinary using the environment variables
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export default cloudinary;
