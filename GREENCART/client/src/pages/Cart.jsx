import { useEffect, useState } from "react";
import { useAppcontext } from "../context/Appcontext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    removeFromCart,
    getCartCount,
    updateCartItem,
    navigate,
    getCartAmount,
    user,
    setCartItems
  } = useAppcontext();

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOptions] = useState("COD");
const getCart = () => {
  let tempArray = [];

  console.log("=== DEBUG: Products loaded ===", products);
  console.log("=== DEBUG: Cart Items ===", cartItems);

  for (const key in cartItems) {
    const product = products.find((item) => item._id?.toString() === key?.toString());

    if (product) {
      product.quantity = cartItems[key];
      tempArray.push(product);
    } else {
      console.warn(`❌ Product not found in 'products' for cart item ID: ${key}`);
    }
  }

  setCartArray(tempArray);
};



  const getUserAddress = async () => {
    try {
      // Send userId in the request body for POST request
      const { data } = await axios.post("/api/address/get", {
        userId: user._id
      });
      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to fetch addresses");
    }
  };

  // Updated placeOrder function in Cart.jsx
const placeOrder = async () => {
  try {
    if (!selectedAddress) {
      return toast.error("Please select a delivery address");
    }

    if (!user || !user._id) {
      return toast.error("User not authenticated");
    }

    if (cartArray.length === 0) {
      return toast.error("Cart is empty");
    }

    // Validate that all products have required properties
    const invalidProducts = cartArray.filter(item => !item._id || !item.quantity);
    if (invalidProducts.length > 0) {
      console.error("Invalid products found:", invalidProducts);
      return toast.error("Some products in cart are invalid");
    }

    // Place order with COD
    if (paymentOption === "COD") {
      // Create order items with product details
      const orderItems = cartArray.map(item => {
        const validPrice = parseFloat(item.offerPrice ?? item.price ?? 0);
        return {
          product: item._id,
          name: item.name,           // ✅ Add product name
          category: item.category,   // ✅ Add category  
          image: item.image?.[0] || '',
          offerPrice: validPrice,    // ✅ Add price
          quantity: parseInt(item.quantity),
          weight: item.Weight || 'N/A'
        };
      });

      const orderData = {
        userId: user._id,
        items: orderItems,
        // ✅ Send full address object instead of just ID
        address: {
          firstName: selectedAddress.firstName || selectedAddress.name?.split(' ')[0] || 'N/A',
          lastName: selectedAddress.lastName || selectedAddress.name?.split(' ')[1] || '',
          phone: selectedAddress.phone || 'N/A',
          street: selectedAddress.street || 'Address not provided',
          city: selectedAddress.city || 'City not provided',
          state: selectedAddress.state || 'State not provided',
          country: selectedAddress.country || 'Country not provided',
          zipcode: selectedAddress.zipcode || selectedAddress.postalCode || 'N/A'
        },
        paymentMethod: paymentOption,
        totalAmount: getCartAmount() + (getCartAmount() * 0.02), // Including 2% tax
        tax: getCartAmount() * 0.02,
        shippingFee: 0
      };

      console.log("Placing order with complete data:", orderData);

      const { data } = await axios.post('/api/order/cod', orderData);

      if (data.success) {
        toast.success(data.message || "Order placed successfully!");
        setCartItems({});
        navigate('/my-orders');
      } else {
        console.error("Order failed - Backend response:", data);
        toast.error(data.message || "Failed to place order");
      }
    } else {
      // Handle online payment
      //place order with Stripe
    const { data } = await axios.post('/api/order/stripe', {
  userId: user._id,
  items: cartArray.map(item => ({ product: item._id, quantity: item.quantity })),
  address: {
    firstName: selectedAddress.firstName || selectedAddress.name?.split(' ')[0] || 'N/A',
    lastName: selectedAddress.lastName || selectedAddress.name?.split(' ')[1] || '',
    phone: selectedAddress.phone || 'N/A',
    street: selectedAddress.street || 'Address not provided',
    city: selectedAddress.city || 'City not provided',
    state: selectedAddress.state || 'State not provided',
    country: selectedAddress.country || 'Country not provided',
    zipcode: selectedAddress.zipcode || selectedAddress.postalCode || 'N/A'
  }
});

      if(data.success){
       window.location.replace(data.url)
      }else{
        toast.error(data.message)
      }
       
      
    }

  } catch (error) {
    console.error("Error placing order - Full error:", error);
    console.error("Error response:", error.response?.data);
    
    // More specific error handling
    if (error.response?.status === 400) {
      toast.error(error.response.data?.message || "Invalid order data");
    } else if (error.response?.status === 401) {
      toast.error("Please login to place order");
    } else if (error.response?.status === 422) {
      toast.error("Order validation failed. Please check your cart items.");
    } else {
      toast.error(error.response?.data?.message || error.message || "Failed to place order");
    }
  }
};
useEffect(() => {
  if (products.length > 0 && Object.keys(cartItems).length > 0) {
    getCart();
  }
}, [products, cartItems]);


  useEffect(() => {
    if (user && user._id) {
      getUserAddress();
    }
  }, [user]);

  return products.length > 0 && cartItems ? (
    <div className="flex flex-col md:flex-row mt-16">
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart <span className="text-sm text-green-500">{getCartCount()} Items</span>
        </h1>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
          <p className="text-left">Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map((product, index) => (
          <div
            key={product._id || index}
            className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3"
          >
            <div className="flex items-center md:gap-6 gap-3">
              <div
                onClick={() => {
                  navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
                  scrollTo(0, 0);
                }}
                className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded"
              >
                <img
                  className="max-w-full h-full object-cover"
                  src={product.image[0]}
                  alt={product.name}
                />
              </div>
              <div>
                <p className="hidden md:block font-semibold">{product.name}</p>
                <div className="font-normal text-gray-500/70">
                  <p>
                    Weight: <span>{product.Weight || "N/A"}</span>
                  </p>
                  <div className="flex items-center">
                    <p>Qty:</p>
                    <select
                      onChange={(e) => updateCartItem(product._id, Number(e.target.value))}
                      value={cartItems[product._id]}
                      className="outline-none"
                    >
                      {Array(cartItems[product._id] > 9 ? cartItems[product._id] : 9)
                        .fill("")
                        .map((_, index) => (
                          <option key={`qty-${product._id}-${index}`} value={index + 1}>
                            {index + 1}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center">
              {currency}
              {Number(product?.offerPrice ?? product?.price ?? 0) * Number(product.quantity || 1)}
            </p>

            <button onClick={() => removeFromCart(product._id)} className="cursor-pointer mx-auto">
              <img
                src={assets.remove_icon}
                alt="remove"
                className="inline-block w-6 h-6"
              />
            </button>
          </div>
        ))}

        <button
          onClick={() => {
            navigate("/products");
            scrollTo(0, 0);
          }}
          className="group cursor-pointer flex items-center mt-8 gap-2 text-green-500 font-medium"
        >
          <img
            className="group-hover:-translate-x-1 transition"
            src={assets.arrow_right_icon_colored}
            alt="arrow"
          />
          Continue Shopping
        </button>
      </div>

      <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
        <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
        <hr className="border-gray-300 my-5" />

        <div className="mb-6">
          <p className="text-sm font-medium uppercase">Delivery Address</p>
          <div className="relative flex justify-between items-start mt-2">
            <p className="text-gray-500">
              {selectedAddress
                ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
                : "No address found"}
            </p>
            <button
              onClick={() => setShowAddress(!showAddress)}
              className="text-green-500 hover:underline cursor-pointer"
            >
              Change
            </button>
            {showAddress && (
              <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full z-10">
                {addresses.map((address, index) => (
                  <p
                    key={address._id || address.id || `address-${index}`}
                    onClick={() => {
                      setSelectedAddress(address);
                      setShowAddress(false);
                    }}
                    className="text-gray-500 p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {address.street},{address.city},{address.state},{address.country}
                  </p>
                ))}
                <p
                  onClick={() => navigate("/add-address")}
                  className="text-green-500 text-center cursor-pointer p-2 hover:bg-green-100"
                >
                  Add address
                </p>
              </div>
            )}
          </div>

          <p className="text-sm font-medium uppercase mt-6">Payment Method</p>

          <select
            onChange={(e) => setPaymentOptions(e.target.value)}
            className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none"
          >
            <option value="COD">Cash On Delivery</option>
            <option value="Online">Online Payment</option>
          </select>
        </div>

        <hr className="border-gray-300" />

        <div className="text-gray-500 mt-4 space-y-2">
          <p className="flex justify-between">
            <span>Price</span>
            <span>
              {currency}
              {getCartAmount()}
            </span>
          </p>
          <p className="flex justify-between">
            <span>Shipping Fee</span>
            <span className="text-green-600">Free</span>
          </p>
          <p className="flex justify-between">
            <span>Tax (2%)</span>
            <span>
              {currency}
              {getCartAmount() * 2 / 100}
            </span>
          </p>
          <p className="flex justify-between text-lg font-medium mt-3">
            <span>Total Amount:</span>
            <span>
              {currency}
              {getCartAmount() + getCartAmount() * 2 / 100}
            </span>
          </p>
        </div>

        <button
          onClick={placeOrder}
          className="w-full py-3 mt-6 cursor-pointer bg-green-500 text-white font-medium hover:bg-green-600 transition"
        >
          {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  ) : null;
};

export default Cart;