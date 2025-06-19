// models/product.js - UPDATED WITH INVENTORY

import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  offerPrice: { 
    type: Number, 
    required: true,
    min: 0
  },
  image: { 
    type: Array, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  inStock: { 
    type: Boolean, 
    default: true 
  },
  // ✅ ADD INVENTORY MANAGEMENT FIELDS
  inventory: {
    type: Number,
    default: 0, // Set to actual stock count
    min: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5 // Alert when stock is below this number
  },
  Weight: {
    type: String,
    default: "N/A"
  },
  // ✅ TRACK TOTAL SOLD
  soldCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, { 
  timestamps: true 
});

// ✅ ADD PRE-SAVE MIDDLEWARE TO UPDATE inStock STATUS
productSchema.pre('save', function(next) {
  // Automatically set inStock based on inventory
  if (this.inventory !== undefined) {
    this.inStock = this.inventory > 0;
  }
  next();
});

// ✅ ADD METHODS FOR INVENTORY MANAGEMENT
productSchema.methods.reduceInventory = function(quantity) {
  if (this.inventory >= quantity) {
    this.inventory -= quantity;
    this.soldCount += quantity;
    this.inStock = this.inventory > 0;
    return this.save();
  } else {
    throw new Error(`Insufficient stock. Available: ${this.inventory}, Requested: ${quantity}`);
  }
};

productSchema.methods.addInventory = function(quantity) {
  this.inventory += quantity;
  this.inStock = this.inventory > 0;
  return this.save();
};

productSchema.methods.isLowStock = function() {
  return this.inventory <= this.lowStockThreshold;
};

// ✅ ADD STATIC METHODS
productSchema.statics.findLowStockProducts = function() {
  return this.find({
    $expr: { $lte: ["$inventory", "$lowStockThreshold"] }
  });
};

productSchema.statics.findOutOfStockProducts = function() {
  return this.find({
    $or: [
      { inventory: 0 },
      { inStock: false }
    ]
  });
};

const product = mongoose.models.product || mongoose.model('product', productSchema);

export default product;