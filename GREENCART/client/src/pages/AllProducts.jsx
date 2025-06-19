import React, { useEffect, useState } from 'react';
import { useAppcontext } from '../context/Appcontext';
import ProductCard from '../components/ProductCard';

const AllProducts = () => {
  const { products, serchQuery } = useAppcontext(); // ✅ Ensure variable matches spelling
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (serchQuery.length > 0) {
      setFilteredProducts(
        products.filter(product =>
          product.name.toLowerCase().includes(serchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [products, serchQuery]);

  return (
    <div className="mt-16 flex flex-col">
      <div className="flex flex-col items-end w-max">
        <p className="text-2xl font-medium uppercase">All Products</p>
        <div className="w-16 h-0.5 bg-green-500 rounded-full"></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6">
        {filteredProducts
          .filter(product => product.inStock)
          .map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
      </div>
    </div>
  );
};

export default AllProducts;
