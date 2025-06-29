import React from "react";
import { assets } from "../assets/assets";
import { useAppcontext } from "../context/Appcontext";

const ProductCard = ({ product }) => {
  
  const { currency, addToCart, removeFromCart, cartItems, navigate } = useAppcontext();

  // Debug: Log the product data to see what's actually coming from backend
  console.log("ProductCard - Product data:", product);
  console.log("ProductCard - Price:", product?.price);
  console.log("ProductCard - OfferPrice:", product?.offerPrice);
  console.log("ProductCard - All keys:", Object.keys(product || {}));

  return product && (
    <div
      onClick={() => {
        navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
        scrollTo(0, 0);
      }}
      className="border border-gray-200 rounded-lg bg-white overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer group"
    >
      {/* Product Image */}
      <div className="relative bg-gray-50 flex items-center justify-center p-6 md:p-8 h-48 md:h-56">
        <img 
          className="group-hover:scale-105 transition-transform duration-200 max-h-full max-w-full object-contain" 
          src={product.image[0]} 
          alt={product.name} 
        />
      </div>

      {/* Product Details */}
      <div className="p-4 md:p-5">
        {/* Category */}
        <p className="text-gray-400 text-xs md:text-sm uppercase tracking-wide mb-1">
          {product.category}
        </p>
        
        {/* Product Name */}
        <h3 className="text-gray-800 font-medium text-base md:text-lg mb-2 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {Array(5).fill('').map((_, i) => (
            <img 
              key={i} 
              className="w-3 h-3 md:w-3.5 md:h-3.5" 
              src={i < 4 ? assets.star_icon : assets.star_dull_icon} 
              alt="" 
            />
          ))}
          <span className="text-gray-400 text-xs md:text-sm ml-1">(4)</span>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          {/* Price Section */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-lg md:text-xl font-semibold text-gray-900">
                {currency}
                {(() => {
                  let displayPrice = product.offerPrice ?? product.price ?? 0;
                  displayPrice = Number(displayPrice);
                  return isNaN(displayPrice) ? 'N/A' : displayPrice.toFixed(2);
                })()}
              </span>
              
              {product.offerPrice && product.price && product.offerPrice !== product.price && (
                <span className="text-gray-400 text-sm md:text-base line-through">
                  {currency}{Number(product.price).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Section */}
          <div onClick={(e) => { e.stopPropagation(); }}>
            {!cartItems[product._id] ? (
              <button 
                className="flex items-center justify-center gap-1.5 bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 px-3 py-2 md:px-4 md:py-2.5 rounded-md text-green-600 font-medium text-sm md:text-base transition-colors duration-200" 
                onClick={() => addToCart(product._id)}
              >
                <img src={assets.cart_icon} alt='cart icon' className="w-4 h-4" />
                Add
              </button>
            ) : (
              <div className="flex items-center bg-green-50 border border-green-200 rounded-md overflow-hidden">
                <button 
                  onClick={() => { removeFromCart(product._id) }} 
                  className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 text-green-600 hover:bg-green-100 transition-colors duration-200 font-medium"
                >
                  -
                </button>
                <span className="flex items-center justify-center min-w-[32px] md:min-w-[36px] h-8 md:h-9 text-green-600 font-medium text-sm md:text-base">
                  {cartItems[product._id]}
                </span>
                <button 
                  onClick={() => { addToCart(product._id) }} 
                  className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 text-green-600 hover:bg-green-100 transition-colors duration-200 font-medium"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;