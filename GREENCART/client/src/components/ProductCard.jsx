import React from "react";
import { assets } from "../assets/assets";
import { useAppcontext } from "../context/Appcontext";

const ProductCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } = useAppcontext();

  return product && (
    <div
      onClick={() => {
        navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
        scrollTo(0, 0);
      }}
      className="border border-gray-300 rounded-md px-3 py-2 bg-white w-full max-w-[180px] sm:max-w-[200px]"
    >
      <div className="group cursor-pointer flex items-center justify-center px-2">
        <img className="group-hover:scale-105 transition max-w-full h-auto object-contain" src={product.image[0]} alt={product.name} />
      </div>
      <div className="text-gray-500/60 text-sm mt-2">
        <p>{product.category}</p>
        <p className="text-gray-700 font-medium text-base truncate">{product.name}</p>
        <div className="flex items-center gap-1 mt-1">
          {Array(5).fill('').map((_, i) => (
            <img key={i} className="w-3" src={i < 4 ? assets.star_icon : assets.star_dull_icon} alt="" />
          ))}
          <p className="text-xs">(4)</p>
        </div>

        <div className="flex items-end justify-between mt-3">
          <div className="text-base font-medium text-green-600">
            {currency}
            {(() => {
              let displayPrice = product.offerPrice ?? product.price ?? 0;
              displayPrice = Number(displayPrice);
              return isNaN(displayPrice) ? 'N/A' : displayPrice.toFixed(2);
            })()}
            {product.offerPrice && product.price && product.offerPrice !== product.price && (
              <span className="text-gray-500/60 text-xs line-through ml-1">
                {currency}{Number(product.price).toFixed(2)}
              </span>
            )}
          </div>
          <div onClick={(e) => { e.stopPropagation(); }} className="text-green-600">
            {!cartItems[product._id] ? (
              <button className="flex items-center gap-1 bg-green-100 border border-green-300 w-14 h-8 rounded text-xs" onClick={() => addToCart(product._id)} >
                <img src={assets.cart_icon} alt='cart icon' className="w-3 h-3" />
                Add
              </button>
            ) : (
              <div className="flex items-center gap-2 w-16 h-8 bg-indigo-500/25 rounded text-xs">
                <button onClick={() => { removeFromCart(product._id) }} className="px-2">-</button>
                <span className="w-4 text-center">{cartItems[product._id]}</span>
                <button onClick={() => { addToCart(product._id) }} className="px-2">+</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
