import React from 'react'
import { useAppcontext } from '../context/Appcontext'
import { useParams } from 'react-router-dom'
import { categories } from '../assets/assets'
import ProductCard from '../components/ProductCard'

const ProductCategory = () => {
  const {products} = useAppcontext()
  const {category}= useParams()
  const serchCategory= categories.find((item)=> item.path.toLowerCase()=== category)
  const filteredProducts =products.filter((product)=>product.category.toLowerCase() === category)
  return (
    <div className='mt-16'>
      {serchCategory && (
        <div className='flex flex-col items-end w-max'>
          <p className='text-2xl font-medium'>{serchCategory.text.toUpperCase()} </p>
          <div className='w-16 h-0.5 bg-green rounded-full'></div>
        </div>
      )}
      {filteredProducts.length > 0 ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6'>
          {filteredProducts.map((product)=> (
            <ProductCard key={product._id} product={product}/>
          ))}
        </div>
      ) : (
        <div className='flex items-center justify-center h-[60vh]'>
          <p className='text-2xl font-medium text-primary'>No Products Found In This Category</p>
        </div>
      )}
     
    </div>
  )
}

export default ProductCategory
