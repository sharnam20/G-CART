import React from 'react'
import { categories } from '../assets/assets'
import { useAppcontext } from '../context/Appcontext'

const Categories = () => {
  const { navigate } = useAppcontext()  // ✅ FIXED

  return (
    <div className='mt-16'>
      <p className='text-2xl md:text-3xl font-medium'>Categories</p>  
      
      <div className='flex gap-6 overflow-x-auto mt-6 no-scrollbar'>  {/* ✅ FIXED */}
        {categories.map((category, index) => (
          <div
            key={index}
            className='group cursor-pointer py-5 px-3 gap-2 rounded-lg flex flex-col justify-center items-center'
            style={{ backgroundColor: category.bgColor }}
            onClick={() => {
              navigate(`/products/${category.path.toLowerCase()}`)
              scrollTo(0, 0)
            }}
          >    
            <img src={category.image} alt={category.text} className='group-hover:scale-108 transition max-w-28' />
            <p className='text-sm font-medium'>{category.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Categories
