// models/Order.js - FIXED VERSION

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      product: {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product", // Matches your product model name
          required: true
        },
        name: {
          type: String,
          required: true
        },
        category: {
          type: String,
          required: true
        },
        image: [String],
        offerPrice: {
          type: Number,
          required: true
        }
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
      },
      status: {
        type: String,
        enum: ["Processing", "Packed", "Shipped", "Delivered", "Cancelled"],
        default: "Processing"
      }
    }
  ],
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  address: {
    firstName: { 
      type: String, 
      required: true,
      default: "N/A" 
    },
    lastName: { 
      type: String, 
      default: "" 
    },
    phone: { 
      type: String, 
      required: true,
      default: "N/A" 
    },
    street: { 
      type: String, 
      required: true,
      default: "Address not provided" 
    },
    city: { 
      type: String, 
      required: true,
      default: "City not provided" 
    },
    state: { 
      type: String, 
      required: true,
      default: "State not provided" 
    },
    country: { 
      type: String, 
      required: true,
      default: "Country not provided" 
    },
    zipcode: { 
      type: String, 
      default: "N/A" 
    }
  },
  paymentType: {
    type: String,
    enum: ["COD", "Online", "Stripe", "Razorpay"],
    required: true,
    default: "COD"
  },
 status: {
  type: String,
  enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Confirmed'], // add Confirmed here
  default: 'Processing'
},

  isPaid: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt field before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add index for better performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentType: 1 });

export default mongoose.model("Order", orderSchema);