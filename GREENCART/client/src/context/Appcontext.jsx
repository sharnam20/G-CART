import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const Appcontext = createContext();

export const Appcontextprovider = ({ children }) => {

  const currency =import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const [user, setuser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([])
       const [cartItems, setCartItems] = useState({})
       const [serchQuery,setSerchQuery] = useState({})

       // fetch seller status

       const fetchSeller = async ()=>{
        try{
          const {data} =await axios.get('/api/seller/is-auth')
          if(data.success){
            setIsSeller(true)
          }else{
            setIsSeller(false)
          }
        }catch(error){
        setIsSeller(false)

        }
       }

       // fetch user auth status , user data and cart items

      const fetchUser = async ()=>{
        try{
            // ✅ FIXED: Added missing leading slash
            const {data} = await axios.get('/api/user/is-auth');
            console.log('fetchUser response:', data); // Debug log
            if(data.success){
              setuser(data.user)
              setCartItems(data.user.cartItems || {})
              console.log('User set:', data.user); // Debug log
            } else {
              console.log('fetchUser failed:', data.message);
              setuser(null)
              setCartItems({}) // Clear cart items when no user
            }
        }catch(error){
          console.error('fetchUser error:', error);
          setuser(null)
          setCartItems({}) // Clear cart items on error
        }

      }

      // Logout function
      const logout = async () => {
        try {
          const { data } = await axios.post('/api/user/logout');
          if (data.success) {
            setuser(null);
            setCartItems({});
            setIsSeller(false);
            toast.success('Logged out successfully');
            navigate('/');
          }
        } catch (error) {
          console.error('Logout error:', error);
          // Force logout even if API call fails
          setuser(null);
          setCartItems({});
          setIsSeller(false);
          toast.success('Logged out successfully');
          navigate('/');
        }
      }
      
     // fetch all product 
    const fetchProduct = async()=> {
      try{
        const { data } = await axios.get('/api/product/list')
        if(data.success){
          // Debug: Log the products data from backend
          console.log("Fetched products from backend:", data.products);
          console.log("First product sample:", data.products[0]);
          setProducts(data.products)
        }else{
          toast.error(data.message)
        }

      }catch(error){
             toast.error(error.message)
      }
    }
    // add product to cart
    const addToCart =(itemId)=>{
      let cartData = structuredClone(cartItems);
      
      if(cartData[itemId])
        {
        cartData[itemId] += 1;
        }
        else {
          cartData[itemId]=1;
        }
        setCartItems(cartData);
        toast.success("added to cart")
    }

    // upadate cart-item quntity

    const updateCartItem =(itemId, quantity)=>{
      let cartData =structuredClone(cartItems);
      cartData[itemId]=quantity;
      setCartItems(cartData)
      toast.success("cart updated")

    }

    // remove product from cart
    const removeFromCart =(itemId)=>{
      let cartData=structuredClone(cartItems);
      if(cartData[itemId]){
        cartData[itemId] -= 1;
        if(cartData[itemId]===0){
          delete cartData[itemId];
        }
      }
      toast.success("remove from cart")
      setCartItems(cartData)

    }
    // get cart item count 

    const getCartCount =()=>{
      let totalCount =0;
      for(const item in cartItems){
        totalCount += cartItems[item];
      }
      return totalCount;
    }

    // get cart total amount - FIXED VERSION
   // Fixed getCartAmount function for Appcontext.jsx
const getCartAmount = () => {
  try {
    let totalAmount = 0;
    
    // Debug logs
    console.log("Cart calculation - Products:", products.length);
    console.log("Cart calculation - CartItems:", cartItems);
    
    // Return 0 if no products or cart items
    if (!products || products.length === 0) {
      console.log("No products available");
      return 0;
    }
    
    if (!cartItems || Object.keys(cartItems).length === 0) {
      console.log("No cart items");
      return 0;
    }
    
    // Calculate total
    for (const itemId in cartItems) {
      const quantity = cartItems[itemId];
      const itemInfo = products.find((product) => product._id === itemId);
      
      if (itemInfo && quantity > 0) {
        // Try offerPrice first, then fallback to price
        let price = itemInfo.offerPrice || itemInfo.price;
        
        // Convert to number if it's a string
        if (typeof price === 'string') {
          price = parseFloat(price);
        }
        
        const qty = parseInt(quantity);
        
        console.log(`Item ${itemId}:`, { 
          quantity: qty, 
          itemInfo: itemInfo?.name, 
          offerPrice: itemInfo?.offerPrice,
          price: itemInfo?.price,
          finalPrice: price 
        });
        
        if (!isNaN(price) && !isNaN(qty) && price > 0 && qty > 0) {
          const itemTotal = price * qty;
          totalAmount += itemTotal;
          console.log(`Adding: ${price} * ${qty} = ${itemTotal}`);
        } else {
          console.log(`Invalid price or quantity for item ${itemId}:`, { 
            price, 
            qty, 
            offerPrice: itemInfo?.offerPrice,
            regularPrice: itemInfo?.price 
          });
        }
      }
    }
    
    console.log("Total calculated:", totalAmount);
    
    // Return rounded amount
    const result = Math.round(totalAmount * 100) / 100;
    return isNaN(result) ? 0 : result;
    
  } catch (error) {
    console.error("Error calculating cart amount:", error);
    return 0;
  }
};


    useEffect(()=> {
      fetchUser()
      fetchSeller()
      fetchProduct()
    },[])
    /// update database cart itmes
    useEffect(()=>{
      const updateCart = async ()=>{
       try{
           const { data } = await axios.post('/api/cart/update',{cartItems})
           if(!data.success){
            toast.error(data.message)
           }
       }catch(error){
                 toast.error(error.message)
       }
      }
      if(user){
        updateCart()
      }
    },[cartItems])


  const value = { navigate, user, setuser, setIsSeller, isSeller,showUserLogin,setShowUserLogin ,products,currency,addToCart,updateCartItem,removeFromCart,cartItems,serchQuery,setSerchQuery,getCartAmount,getCartCount,axios,fetchProduct,setCartItems,fetchUser,logout

  };
  return (
    <Appcontext.Provider value={value}>
      {children}
    </Appcontext.Provider>
  );
};

export const useAppcontext = () => {
  return useContext(Appcontext);
};