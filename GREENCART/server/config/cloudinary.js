import {v2 as cloudinary} from 'cloudinary';

const connectCloudinary = async() => {
  try {
    console.log("=== CLOUDINARY CONNECTION DEBUG ===");
    console.log("Environment variables check:");
    console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "EXISTS" : "MISSING");
    console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "EXISTS" : "MISSING");
    console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "EXISTS" : "MISSING");
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    // Test the connection
    const result = await cloudinary.api.ping();
    console.log("Cloudinary connection successful:", result);
    console.log("===================================");
    
  } catch (error) {
    console.error("=== CLOUDINARY CONNECTION ERROR ===");
    console.error("Error:", error.message);
    console.error("====================================");
    throw error;
  }
}

export default connectCloudinary;