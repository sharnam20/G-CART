import { request, response } from "express";
import Order from "../models/Order.js"
import product from "../models/product.js";
// import product from "../models/product.js"
import User from "../models/User.js"
import stripe from "stripe"

// Placed Order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
  console.log("=== ORDER PLACEMENT DEBUG START ===");
  
  try {
    const userId = req.userId;
    const { items, address, totalAmount } = req.body;
    
    console.log("1. Request Details:");
    console.log("   - User ID:", userId);
    console.log("   - Items received:", JSON.stringify(items, null, 2));
    console.log("   - Address:", JSON.stringify(address, null, 2));
    console.log("   - Total Amount:", totalAmount);
    
    if (!userId) {
      console.log("❌ ERROR: User not authenticated");
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log("❌ ERROR: Invalid items array");
      return res.status(400).json({ success: false, message: "Cart items are required" });
    }

    if (!address) {
      console.log("❌ ERROR: Address is required");
      return res.status(400).json({ success: false, message: "Delivery address is required" });
    }

    console.log("2. Processing items and updating inventory...");
    
    let calculatedAmount = 0;
    const orderItems = [];

    // Process each item and update inventory
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`   Processing item ${i + 1}:`, JSON.stringify(item, null, 2));
      
      if (!item.product) {
        console.log(`   ❌ ERROR: Item ${i + 1} missing product ID`);
        return res.status(400).json({ success: false, message: `Item ${i + 1} missing product ID` });
      }
      
      console.log(`   Searching for product with ID: ${item.product}`);
      
      const productData = await product.findById(item.product);
      
      if (!productData) {
        console.log(`   ❌ ERROR: Product not found with ID: ${item.product}`);
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }

      console.log(`   ✅ Found product:`, {
        id: productData._id,
        name: productData.name,
        category: productData.category,
        offerPrice: productData.offerPrice,
        price: productData.price,
        inStock: productData.inStock
      });

      // Check if product is in stock
      if (!productData.inStock) {
        console.log(`   ❌ ERROR: Product out of stock: ${productData.name}`);
        return res.status(400).json({ 
          success: false, 
          message: `Product "${productData.name}" is currently out of stock` 
        });
      }

      const itemQuantity = parseInt(item.quantity) || 1;
      const itemPrice = productData.offerPrice || productData.price;
      const itemTotal = itemPrice * itemQuantity;
      calculatedAmount += itemTotal;

      console.log(`   Item calculation: ${itemPrice} × ${itemQuantity} = ${itemTotal}`);

      // ✅ Create order item with all necessary details
      const orderItem = {
        product: {
          _id: productData._id,
          name: productData.name,
          category: productData.category,
          image: productData.image,
          offerPrice: itemPrice
        },
        quantity: itemQuantity,
        status: "Processing"
      };
      
      orderItems.push(orderItem);
      console.log(`   ✅ Order item created:`, JSON.stringify(orderItem, null, 2));
    }

    console.log("3. Order Summary:");
    console.log("   - Total items:", orderItems.length);
    console.log("   - Calculated amount:", calculatedAmount);
    console.log("   - Frontend amount:", totalAmount);

    console.log("4. Creating order object...");
    
    // ✅ Use the address object directly from frontend
    const orderData = {
      user: userId,
      items: orderItems,
      amount: totalAmount || calculatedAmount, // Use frontend calculation
      address: {
        firstName: address.firstName || "N/A",
        lastName: address.lastName || "",
        phone: address.phone || "N/A",
        street: address.street || "Address not provided",
        city: address.city || "City not provided",
        state: address.state || "State not provided",
        country: address.country || "Country not provided",
        zipcode: address.zipcode || "N/A"
      },
      paymentType: "COD",
      status: "Processing",
      isPaid: false, // ✅ Add payment status
      createdAt: new Date(),
    };
    
    console.log("   Order data:", JSON.stringify(orderData, null, 2));
    
    const newOrder = new Order(orderData);
    
    console.log("5. Validating order before save...");
    
    // Validate the order before saving
    const validationError = newOrder.validateSync();
    if (validationError) {
      console.log("❌ VALIDATION ERROR:", validationError);
      return res.status(400).json({ 
        success: false, 
        message: "Order validation failed",
        error: validationError.message,
        details: validationError.errors
      });
    }
    
    console.log("   ✅ Order validation passed");
    
    console.log("6. Saving order to database...");
    
    await newOrder.save();
    
    console.log("   ✅ Order saved successfully with ID:", newOrder._id);
    
    console.log("7. Clearing user cart...");
    
    // Clear user's cart after successful order
    await User.findByIdAndUpdate(userId, { cartItems: {} });
    
    console.log("   ✅ Cart cleared");

    console.log("=== ORDER PLACEMENT SUCCESS ===");

    return res.status(201).json({ 
      success: true, 
      message: "Order placed successfully! Your order is being processed.", 
      order: {
        _id: newOrder._id,
        items: newOrder.items,
        amount: newOrder.amount,
        status: newOrder.status
      }
    });

  } catch (err) {
    console.log("=== ORDER PLACEMENT ERROR ===");
    console.error("❌ Error:", err.message);
    console.error("❌ Stack:", err.stack);
    
    res.status(500).json({ 
      success: false, 
      message: "Failed to place order. Please try again.",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// ✅ FIXED: place order Stripe : '/api/order/stripe'
export const placeOrderStripe = async (req, res) => {
  console.log("=== STRIPE ORDER PLACEMENT START ===");
  
  try {
    const userId = req.userId; // ✅ Get userId from auth middleware, not req.body
const { items, address } = req.body;

// ✅ Address field validation
if (!address) {
  return res.status(400).json({
    success: false,
    message: 'Address is required for online payment'
  });
}

    const { origin } = req.headers;
    
    console.log("1. Stripe Order Details:");
    console.log("   - User ID:", userId);
    console.log("   - Items:", JSON.stringify(items, null, 2));
    console.log("   - Address:", JSON.stringify(address, null, 2));
    console.log("   - Origin:", origin);

    // ✅ Validation
    if (!userId) {
      console.log("❌ ERROR: User not authenticated");
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!address || !items || items.length === 0) {
      console.log("❌ ERROR: Invalid data - address or items missing");
      return res.status(400).json({ success: false, message: 'Address and items are required' });
    }

    // ✅ FIX: Get user data to populate name if missing from address
    console.log("1.1. Fetching user data...");
    const userData = await User.findById(userId);
    if (!userData) {
      console.log("❌ ERROR: User not found");
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    console.log("   ✅ User data:", {
      name: userData.name,
      email: userData.email
    });

    console.log("2. Processing products and calculating amount...");
    
    let productData = [];
    let amount = 0;

    // ✅ Process each item and calculate total amount
    for (const item of items) {
      console.log(`   Processing item:`, JSON.stringify(item, null, 2));
      
      if (!item.product) {
        console.log(`   ❌ ERROR: Missing product ID`);
        return res.status(400).json({ success: false, message: 'Product ID is required for all items' });
      }

      // ✅ Find product by ID
      const productDoc = await product.findById(item.product);
      
      if (!productDoc) {
        console.log(`   ❌ ERROR: Product not found with ID: ${item.product}`);
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }

      console.log(`   ✅ Found product: ${productDoc.name} - Price: ${productDoc.offerPrice || productDoc.price}`);

      const itemPrice = productDoc.offerPrice || productDoc.price;
      const itemQuantity = parseInt(item.quantity) || 1;
      const itemTotal = itemPrice * itemQuantity;
      
      productData.push({
        name: productDoc.name,
        price: itemPrice,
        quantity: itemQuantity,
      });
      
      amount += itemTotal;
      console.log(`   Item total: ${itemPrice} × ${itemQuantity} = ${itemTotal}`);
    }

    console.log("3. Amount calculation:");
    console.log("   - Subtotal:", amount);

    // ✅ Add tax charges (2%)
    const taxAmount = Math.floor(amount * 0.02);
    const finalAmount = amount + taxAmount;
    
    console.log("   - Tax (2%):", taxAmount);
    console.log("   - Final amount:", finalAmount);

    console.log("4. Creating order in database...");

    // ✅ Create order items for database
    const orderItems = [];
    for (const item of items) {
      const productDoc = await product.findById(item.product);
      orderItems.push({
        product: {
          _id: productDoc._id,
          name: productDoc.name,
          category: productDoc.category,
          image: productDoc.image,
          offerPrice: productDoc.offerPrice || productDoc.price
        },
        quantity: parseInt(item.quantity) || 1,
        status: "Processing"
      });
    }

    // ✅ FIX: Create proper address with user data fallback
const orderAddress = {
  firstName: address.firstName || "N/A",
  lastName: address.lastName || "",
  phone: address.phone || "N/A",
  street: address.street || "Address not provided",
  city: address.city || "City not provided",
  state: address.state || "State not provided",
  country: address.country || "Country not provided",
  zipcode: address.zipcode || "N/A"
};


    console.log("   ✅ Final address data:", JSON.stringify(orderAddress, null, 2));

    // ✅ Create order with proper structure
    const order = await Order.create({ 
      user: userId,
      items: orderItems,
      amount: finalAmount,
      address: orderAddress,
      paymentType: "Online",
      status: "Processing", // Start with Processing, update to Confirmed after payment
      isPaid: false, // Will be updated to true after successful payment
      createdAt: new Date()
    });

    console.log("   ✅ Order created with ID:", order._id);

    console.log("5. Setting up Stripe payment...");

    // ✅ Initialize Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log("❌ ERROR: Stripe secret key not configured");
      return res.status(500).json({ success: false, message: 'Payment configuration error' });
    }

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // ✅ Create line items for Stripe
    const line_items = productData.map((item) => {
      const unitAmountWithTax = Math.floor((item.price + item.price * 0.02) * 100); // Convert to cents
      console.log(`   Stripe line item: ${item.name} - ${unitAmountWithTax} cents`);
      
      return {
        price_data: {
          currency: "aud", // ✅ Make sure this matches your currency
          product_data: {
            name: item.name,
          },
          unit_amount: unitAmountWithTax
        },
        quantity: item.quantity,
      };
    });

    console.log("6. Creating Stripe checkout session...");

    // ✅ Create Stripe session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString()
      }
    });

    console.log("   ✅ Stripe session created:", session.id);
    console.log("   ✅ Redirect URL:", session.url);

    console.log("=== STRIPE ORDER PLACEMENT SUCCESS ===");

    return res.json({ success: true, url: session.url });

  } catch (error) {
    console.log("=== STRIPE ORDER PLACEMENT ERROR ===");
    console.error("❌ Error:", error.message);
    console.error("❌ Stack:", error.stack);
    
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to process payment'
    });
  }
};

// ✅ FIXED: stripe webhook to verify payments action : /stripe
export const stripeWebhooks = async (request, response) => {
  console.log("=== STRIPE WEBHOOK START ===");
  
  // Stripe Gateway Initialized
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = request.headers["stripe-signature"];
  let event;
  
  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Webhook event constructed:", event.type);
  } catch (error) {
    console.log("❌ Webhook signature verification failed:", error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event 
  switch (event.type) {
    case "checkout.session.completed": {
      console.log("Processing checkout.session.completed...");
      
      const session = event.data.object;
      const { orderId, userId } = session.metadata;
      
      console.log("Session metadata:", { orderId, userId });
      
      if (!orderId || !userId) {
        console.log("❌ Missing orderId or userId in session metadata");
        break;
      }

      try {
        // ✅ FIX: Update order with payment success
        const order = await Order.findById(orderId);
        
        if (order) {
          console.log("✅ Found order, updating payment status...");
          
          // Mark payment as paid and update status
          await Order.findByIdAndUpdate(orderId, {
            isPaid: true,
            status: "Confirmed" // Update status since payment is successful
          });

          // Clear user cart after successful payment
          await User.findByIdAndUpdate(userId, { cartItems: {} });
          
          console.log("✅ Order updated and cart cleared");
        } else {
          console.log("❌ Order not found with ID:", orderId);
        }
      } catch (updateError) {
        console.error("❌ Error updating order:", updateError);
      }
      break;
    }

    case "payment_intent.succeeded": {
      console.log("Processing payment_intent.succeeded...");
      
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      try {
        // Getting session metadata
        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (sessions.data.length > 0) {
          const { orderId, userId } = sessions.data[0].metadata;
          
          console.log("Payment intent metadata:", { orderId, userId });

          if (orderId && userId) {
            // ✅ Update order with payment success
            const order = await Order.findById(orderId);
            
            if (order) {
              console.log("✅ Found order, updating payment status...");
              
              await Order.findByIdAndUpdate(orderId, {
                isPaid: true,
                status: "Confirmed"
              });

              // Clear user cart
              await User.findByIdAndUpdate(userId, { cartItems: {} });
              
              console.log("✅ Order updated via payment_intent.succeeded");
            }
          }
        }
      } catch (error) {
        console.error("❌ Error processing payment_intent.succeeded:", error);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      console.log("Processing payment_intent.payment_failed...");
      
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      try {
        // Getting session metadata
        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (sessions.data.length > 0) {
          const { orderId } = sessions.data[0].metadata;
          
          if (orderId) {
            console.log("❌ Payment failed, deleting order:", orderId);
            await Order.findByIdAndDelete(orderId);
            console.log("✅ Failed order deleted");
          }
        }
      } catch (error) {
        console.error("❌ Error processing payment failure:", error);
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }
  
  console.log("=== STRIPE WEBHOOK END ===");
  response.json({ received: true });
};

// Get User Orders : /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    
    // ✅ DEBUGGING FOR USER ORDERS TOO
    console.log('=== USER ORDERS API DEBUGGING ===');
    console.log('User ID:', userId);
    console.log('Orders found:', orders.length);
    
    orders.forEach((order, index) => {
      console.log(`\nUser Order ${index + 1}:`);
      console.log('- ID:', order._id);
      console.log('- Payment:', order.paymentType);
      console.log('- Address exists:', !!order.address);
      
      if (order.paymentType !== 'COD' && (!order.address || !order.address.firstName)) {
        console.log('🚨 FOUND PROBLEMATIC ONLINE ORDER:', order._id);
      }
    });
    
    res.json({
      success: true,
      orders: orders
    });
    
  } catch (error) {
    console.error('User orders error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Get All Orders (for seller/admin) : /api/order/all
export const getAllOrders = async (req, res) => {
  try {
    console.log("=== FETCHING ALL ORDERS FOR SELLER ===");

    const allOrders = await Order.find({}).populate({ path: 'user', select: 'name email phone' }).sort({ createdAt: -1 });

    console.log(`Found ${allOrders.length} total orders`);

    // Filter to include only orders with items
    const validOrders = allOrders.filter(order => {
      return order.items && order.items.length > 0;
    });

    console.log(`Filtered to ${validOrders.length} valid orders`);

    // Process orders
    const processedOrders = validOrders.map(order => {
      const orderObj = order.toObject();

      // We already have delivery address in the order
      // So we leave it as it is

      // Ensure items are properly structured
      orderObj.items = orderObj.items.map(item => {
        if (!item.product) return null;

        return {
          ...item,
          quantity: item.quantity || 1,
          status: item.status || "Processing"
        };
      }).filter(item => item !== null);

      return orderObj;
    }).filter(order => order.items.length > 0);

    console.log(`Final processed orders: ${processedOrders.length}`);

    res.json({ success: true, orders: processedOrders });
  } catch (error) {
    console.error("Error fetching all orders!", error);
    res.json({ success: false, message: error.message });
  }
};

export const cleanupOrders = async (req, res) => {
  try {
    const userId = req.userId;
    
    const deleteResult = await Order.deleteMany({
      user: userId,
      $or: [
        { items: { $exists: false } },
        { items: { $size: 0 } },
        { items: [] }
      ]
    });
    
    console.log(`Deleted ${deleteResult.deletedCount} empty orders`);
    
    res.json({ 
      success: true, 
      message: `Cleaned up ${deleteResult.deletedCount} empty orders` 
    });
  } catch (error) {
    console.error("Error cleaning up orders:", error);
    res.json({ success: false, message: error.message });
  }
}