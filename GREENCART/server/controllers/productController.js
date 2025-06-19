import {v2 as cloudinary} from "cloudinary"
import product from "../models/product.js"
import fs from 'fs'
import path from 'path'

// add Product : /api/product/add
export const addProduct = async (req, res) => {
  try {
    console.log("=== ADD PRODUCT DEBUG ===");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const { name, description, category, price, offerPrice } = req.body;
    const images = req.files;

    // Validation
    if (!name || !description || !category || !price || !offerPrice) {
      console.log("Missing required fields");
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (!images || images.length === 0) {
      console.log("No images provided");
      return res.status(400).json({ success: false, message: "At least one image is required." });
    }

    // Validate price values
    const priceNum = parseFloat(price);
    const offerPriceNum = parseFloat(offerPrice);
    
    if (isNaN(priceNum) || isNaN(offerPriceNum) || priceNum <= 0 || offerPriceNum <= 0) {
      return res.status(400).json({ success: false, message: "Invalid price values." });
    }

    console.log("Starting image upload to Cloudinary...");

    // Upload images to Cloudinary
    const imagesUrl = await Promise.all(
      images.map(async (file, index) => {
        try {
          console.log(`Uploading image ${index + 1}: ${file.path}`);
          
          // Check if file exists
          if (!fs.existsSync(file.path)) {
            throw new Error(`File not found: ${file.path}`);
          }

          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: 'image',
            folder: 'products', // Optional: organize uploads in folders
            public_id: `product_${Date.now()}_${index}`, // Optional: custom public_id
          });

          console.log(`Image ${index + 1} uploaded successfully:`, result.secure_url);

          // Clean up temporary file
          try {
            fs.unlinkSync(file.path);
            console.log(`Temporary file deleted: ${file.path}`);
          } catch (deleteError) {
            console.warn(`Could not delete temporary file: ${file.path}`, deleteError.message);
          }

          return result.secure_url;
        } catch (uploadError) {
          console.error(`Error uploading image ${index + 1}:`, uploadError.message);
          throw uploadError;
        }
      })
    );

    console.log("All images uploaded successfully:", imagesUrl);

    // ✅ FIX: Use consistent field naming
    const newProduct = await product.create({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      price: priceNum,
      offerPrice: offerPriceNum, // ✅ Changed from 'offerprice' to 'offerPrice'
      image: imagesUrl,
      inStock: true
    });

    console.log("Product created successfully:", newProduct._id);
    console.log("=========================");

    return res.status(201).json({ 
      success: true, 
      message: "Product added successfully.",
      productId: newProduct._id
    });

  } catch (error) {
    console.error("=== ADD PRODUCT ERROR ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("========================");

    // Clean up any uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
            console.log(`Cleaned up file: ${file.path}`);
          }
        } catch (cleanupError) {
          console.warn(`Could not clean up file: ${file.path}`, cleanupError.message);
        }
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Internal server error. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get product : /api/product/list
export const productList = async(req,res)=>{
  try{
    console.log("Fetching product list...");
    const products = await product.find({}).sort({ createdAt: -1 }); // Sort by newest first
    console.log(`Found ${products.length} products`);
    res.json({success:true, products})
  }catch(error){
    console.error("Product list error:", error.message);
    res.status(500).json({success:false, message: "Failed to fetch products"})
  }
}

// get single Product : /api/product/id
export const productById = async(req,res)=>{
  try{
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({success:false, message: "Product ID is required"});
    }

    console.log("Fetching product by ID:", id);
    const foundProduct = await product.findById(id);
    
    if (!foundProduct) {
      return res.status(404).json({success:false, message: "Product not found"});
    }

    res.json({success:true, product: foundProduct});

  }catch(error){
    console.error("Product by ID error:", error.message);
    res.status(500).json({success:false, message: "Failed to fetch product"})
  }
}

// change product instock : /api/product/stock
export const changeStock = async(req,res)=>{
  try{
    const { id, inStock } = req.body;
    
    if (!id || typeof inStock !== 'boolean') {
      return res.status(400).json({success:false, message: "Invalid request data"});
    }

    console.log(`Updating stock for product ${id} to ${inStock}`);
    
    const updatedProduct = await product.findByIdAndUpdate(
      id, 
      { inStock }, 
      { new: true } // Return updated document
    );
    
    if (!updatedProduct) {
      return res.status(404).json({success:false, message: "Product not found"});
    }

    res.json({success:true, message: "Stock updated successfully"});

  }catch(error){
    console.error("Change stock error:", error.message);
    res.status(500).json({success:false, message: "Failed to update stock"})
  }
}