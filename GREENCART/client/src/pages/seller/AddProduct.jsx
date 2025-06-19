import React, { useState } from 'react'
import { assets, categories } from '../../assets/assets';
import { useAppcontext } from '../../context/Appcontext';
import toast from 'react-hot-toast';

const AddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { axios } = useAppcontext();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    if (isLoading) return; // Prevent multiple submissions
    
    console.log('Form submission started');
    setIsLoading(true);

    try {
      // Validation
      if (!name.trim() || !description.trim() || !category || !price || !offerPrice) {
        toast.error("Please fill in all required fields.");
        return;
      }

      // Validate price values
      const priceNum = parseFloat(price);
      const offerPriceNum = parseFloat(offerPrice);
      
      if (isNaN(priceNum) || isNaN(offerPriceNum) || priceNum <= 0 || offerPriceNum <= 0) {
        toast.error("Please enter valid price values.");
        return;
      }

      if (offerPriceNum > priceNum) {
        toast.error("Offer price cannot be greater than regular price.");
        return;
      }

      // Check for valid files
      const validFiles = files.filter(file => file instanceof File);
      if (validFiles.length === 0) {
        toast.error("Please select at least one image.");
        return;
      }

      // Check file types and sizes
      for (let file of validFiles) {
        if (!file.type.startsWith('image/')) {
          toast.error("All files must be images.");
          return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
          toast.error(`File "${file.name}" is too large. Maximum size is 5MB.`);
          return;
        }
      }

      // Create FormData
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('price', priceNum.toString());
      formData.append('offerPrice', offerPriceNum.toString());

      // Append only valid files
      validFiles.forEach((file) => {
        formData.append('images', file);
      });

      // Log FormData contents for debugging
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("You are not logged in. Please log in to add a product.");
        return;
      }

      console.log('Making API call...');

      // Make API call using axios
      const response = await axios.post('/api/product/add', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response received:', response.data);

      if (response.data.success) {
        toast.success(response.data.message || "Product added successfully!");
        
        // Reset form
        setName('');
        setDescription('');
        setCategory('');
        setPrice('');
        setOfferPrice('');
        setFiles([]);
        
        // Reset file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
          input.value = '';
        });
        
      } else {
        toast.error(response.data.message || "Failed to add product");
      }

    } catch (error) {
      console.error('Detailed error:', error);
      
      if (error.response) {
        // Server responded with error status
        console.error('Error response:', error.response.data);
        const errorMessage = error.response.data?.message || `Server Error: ${error.response.status}`;
        toast.error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        toast.error('Network error: No response from server');
      } else {
        // Something else happened
        console.error('Error setting up request:', error.message);
        toast.error('Error: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (index, file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select only image files.');
        return;
      }
      
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB.');
        return;
      }
    }
    
    const updatedFiles = [...files];
    updatedFiles[index] = file;
    setFiles(updatedFiles);
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <form onSubmit={onSubmitHandler} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {Array(4).fill('').map((_, index) => (
              <label key={index} htmlFor={`image${index}`} className="cursor-pointer">
                <input
                  onChange={(e) => handleFileChange(index, e.target.files[0])}
                  type="file"
                  id={`image${index}`}
                  accept="image/*"
                  hidden
                />
                <img
                  className="max-w-24 border-2 border-dashed border-gray-300 rounded-lg p-2 hover:border-gray-400 transition-colors"
                  src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area}
                  alt="Upload Area"
                  width={100}
                  height={100}
                />
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Product Name *
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            id="product-name"
            type="text"
            placeholder="Enter product name"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-green-400 transition-colors"
            required
          />
        </div>
        
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-description">
            Product Description *
          </label>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            id="product-description"
            rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none focus:border-green-400 transition-colors"
            placeholder="Enter product description"
            required
          ></textarea>
        </div>
        
        <div className="w-full flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="category">
            Category *
          </label>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            id="category"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-green-400 transition-colors"
            required
          >
            <option value="">Select Category</option>
            {categories.map((item, index) => (
              <option key={index} value={item.path}>{item.path}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Product Price *
            </label>
            <input
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              id="product-price"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-green-400 transition-colors"
              required
            />
          </div>
          
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">
              Offer Price *
            </label>
            <input
              onChange={(e) => setOfferPrice(e.target.value)}
              value={offerPrice}
              id="offer-price"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-green-400 transition-colors"
              required
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className={`px-8 py-2.5 text-white font-medium rounded cursor-pointer transition-colors ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-400 hover:bg-green-500'
          }`}
        >
          {isLoading ? 'Adding Product...' : 'ADD PRODUCT'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;