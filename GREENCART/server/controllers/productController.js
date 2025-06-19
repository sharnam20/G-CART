import {v2 as cloudinary} from "cloudinary"
import product from "../models/product.js"
import fs from 'fs'
import path from 'path'

// add Product : /api/product/add
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
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ success: false, message: "At least one image is required." });
    }

    // Validate price values
    const priceNum = parseFloat(price);
    const offerPriceNum = parseFloat(offerPrice);
    
    if (isNaN(priceNum) || isNaN(offerPriceNum) || priceNum <= 0 || offerPriceNum <= 0) {
      return res.status(400).json({ success: false, message: "Invalid price values." });
    }

    // Upload images directly from memory to Cloudinary
    const imagesUrl = await Promise.all(
      images.map(async (file, index) => {
        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        const result = await cloudinary.uploader.upload(base64Image, {
          folder: "products",
          public_id: `product_${Date.now()}_${index}`,
        });
        return result.secure_url;
      })
    );

    // Create product
    const newProduct = await product.create({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      price: priceNum,
      offerPrice: offerPriceNum,
      image: imagesUrl,
      inStock: true
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully.",
      productId: newProduct._id
    });

  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
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