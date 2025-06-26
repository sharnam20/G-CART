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
    <div onClick={()=> {navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0,0)}}className="border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white min-w-56 max-w-56 w-full">
      <div className="group cursor-pointer flex items-center justify-center px-2">
        <img className="group-hover:scale-105 transition max-w-26 md:max-w-36" src={product.image[0]} alt={product.name} />
      </div>
      <div className="text-gray-500/60 text-sm">
        <p>{product.category}</p>
        <p className="text-gray-700 font-medium text-lg truncate w-full">{product.name}</p>
        <div className="flex items-center gap-0.5">
          {Array(5).fill('').map((_, i) => (
            <img key={i} className="md:w-3.5 w-3" src={i < 4 ? assets.star_icon : assets.star_dull_icon} alt="" />
          ))}
          <p>(4)</p>
        </div>
       


<div className="flex items-end justify-between mt-3">
  <div className="md:text-xl text-base font-medium text-green-600">
    {currency}
    {(() => {
      let displayPrice = product.offerPrice ?? product.price ?? 0;
      displayPrice = Number(displayPrice);
      return isNaN(displayPrice) ? 'N/A' : displayPrice.toFixed(2);
    })()}

    {product.offerPrice && product.price && product.offerPrice !== product.price && (
      <span className="text-gray-500/60 md:text-sm text-xs line-through ml-2">
        {currency}{Number(product.price).toFixed(2)}
      </span>
    )}
  </div>

  <div onClick={(e) => { e.stopPropagation(); }} className="text-green-600">
    {!cartItems[product._id] ? (
      <button className="flex items-center justify-center gap-1 bg-green-100 border border-green-300 md:w-[80px] w-[64px] h-[34px] rounded text-green-600 font-medium cursor-pointer" onClick={() => addToCart(product._id)} >
        <img src={assets.cart_icon} alt='cart icon' />
        Add
      </button>
    ) : (
      <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-indigo-500/25 rounded select-none">
        <button onClick={() => { removeFromCart(product._id) }} className="cursor-pointer text-md px-2 h-full" >
          -
        </button>
        <span className="w-5 text-center">{cartItems[product._id]}</span>
        <button onClick={() => { addToCart(product._id) }} className="cursor-pointer text-md px-2 h-full" >
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