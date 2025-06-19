// file: authSeller.js - DEBUG VERSION
import jwt from 'jsonwebtoken';

const authSeller = async (req, res, next) => {
  console.log("=== AUTH SELLER DEBUG START ===");
  
  try {
    let token;

    console.log("1. Checking for token...");
    console.log("   Authorization header:", req.headers.authorization);
    console.log("   Cookies:", req.cookies);

    // ✅ Prefer header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
      console.log("   ✅ Token found in Authorization header");
    } else if (req.cookies.token) {
      token = req.cookies.token;
      console.log("   ✅ Token found in cookies");
    }

    console.log("   Token (first 20 chars):", token ? token.substring(0, 20) + "..." : "NO TOKEN");

    if (!token) {
      console.log("   ❌ No token found");
      return res.status(401).json({ success: false, message: 'Not Authorized - No Token' });
    }

    console.log("2. Verifying token...");
    console.log("   JWT_SECRET exists:", !!process.env.JWT_SECRET);
    console.log("   JWT_SECRET (first 10 chars):", process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + "..." : "NOT SET");

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("   ✅ Token decoded successfully");
    console.log("   Decoded token:", JSON.stringify(tokenDecode, null, 2));

    console.log("3. Checking seller email...");
    console.log("   Token email:", tokenDecode.email);
    console.log("   Expected SELLER_EMAIL:", process.env.SELLER_EMAIL);
    console.log("   Emails match:", tokenDecode.email === process.env.SELLER_EMAIL);

    if (tokenDecode.email === process.env.SELLER_EMAIL) {
      console.log("   ✅ Seller email matches");
      req.seller = tokenDecode;
      console.log("=== AUTH SELLER SUCCESS ===");
      next();
    } else {
      console.log("   ❌ Seller email doesn't match");
      return res.status(401).json({ success: false, message: 'Invalid Seller - Email Mismatch' });
    }
  } catch (error) {
    console.log("=== AUTH SELLER ERROR ===");
    console.log("❌ Error type:", error.name);
    console.log("❌ Error message:", error.message);
    console.log("❌ Full error:", error);
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid Token',
      error: error.message,
      errorType: error.name
    });
  }
};

export default authSeller;