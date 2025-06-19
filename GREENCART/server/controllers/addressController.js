// Add Address : /api/address/add

import Address from "../models/Address.js"

export const addAddress = async(req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('User ID from middleware:', req.userId);
    console.log('Request headers:', req.headers);
    
    // Extract fields from req.body
    const {
      firstName,
      lastName,
      email,
      street,
      city,
      state,
      zipcode,
      country,
      phone
    } = req.body;

    // Get userId from middleware (set by authUser middleware)
    const userId = req.userId;

    console.log('Extracted userId:', userId);

    // Validate userId first
    if (!userId) {
      console.log('No userId found in request');
      return res.status(401).json({
        success: false,
        message: "User not authenticated. Please login again."
      });
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !street || !city || !state || !zipcode || !country || !phone) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Validate zipcode is a valid number
    const zipcodeNum = Number(zipcode);
    if (isNaN(zipcodeNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid zipcode format"
      });
    }

    // Create the address
    const newAddress = await Address.create({
      userId: userId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zipcode: zipcodeNum,
      country: country.trim(),
      phone: phone.trim()
    });

    console.log('Address created successfully:', newAddress);
    
    res.status(200).json({
      success: true,
      message: "Address Added Successfully",
      address: newAddress
    });

  } catch(error) {
    console.error('Error in addAddress:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
}

// Get Address : /api/address/get
export const getAddress = async(req, res) => {
  try {
    // Get userId from middleware
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    
    const addresses = await Address.find({ userId });
    res.status(200).json({
      success: true,
      addresses
    });
  } catch(error) {
    console.error('Error in getAddress:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
}