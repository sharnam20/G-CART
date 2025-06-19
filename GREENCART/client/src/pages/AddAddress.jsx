import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { useAppcontext } from '../context/Appcontext'
import toast from 'react-hot-toast'

// Input Field Components
const InputField = ({type, placeholder, name, handleChange, address}) => (
  <input 
    className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-green-300 transition'
    type={type}
    placeholder={placeholder}
    onChange={handleChange}
    name={name}
    value={address[name] || ''}
    required
  />
)

const AddAddress = () => {
  const {axios, user, navigate} = useAppcontext();
  
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
  })

  const handleChange = (e) => {
    const {name, value} = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }))
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    // Add validation before sending
    const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone'];
    const emptyFields = requiredFields.filter(field => !address[field] || String(address[field]).trim() === '');
    
    if (emptyFields.length > 0) {
      toast.error('Please fill in all required fields');
      console.log('Empty fields:', emptyFields);
      return;
    }

    // Debug logs
    console.log('Current user:', user);
    console.log('User type:', typeof user);
    console.log('User keys:', user ? Object.keys(user) : 'user is null/undefined');

    // Check if user exists - be more specific about what's missing
    if (!user) {
      toast.error('User session not found. Please login again.');
      navigate('/login');
      return;
    }

    if (!user._id) {
      toast.error('User ID not found. Please login again.');
      console.error('User object exists but _id is missing:', user);
      navigate('/login');
      return;
    }

    try {
      // Since you're using authUser middleware, you don't need to send userId
      // The middleware will extract it from the token
      const addressData = {
        firstName: address.firstName.trim(),
        lastName: address.lastName.trim(),
        email: address.email.trim(),
        street: address.street.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        zipcode: parseInt(address.zipcode),
        country: address.country.trim(),
        phone: address.phone.trim()
      };

      console.log('Sending address data:', addressData);

      // The authUser middleware will handle authentication
      const response = await axios.post('/api/address/add', addressData, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true // Important: This ensures cookies are sent
      });

      const { data } = response;

      if (data.success) {
        toast.success(data.message || 'Address saved successfully!')
        navigate('/cart')
      } else {
        toast.error(data.message || 'Failed to save address')
      }
    } catch (error) {
      console.error('Address submission error:', error);
      console.error('Error response:', error.response?.data);
      
      // More specific error handling
      if (error.response?.status === 400) {
        toast.error('Invalid data. Please check all fields.')
      } else if (error.response?.status === 401) {
        toast.error('Please login again.')
        navigate('/login')
      } else {
        toast.error(error.response?.data?.message || error.message || 'Failed to save address')
      }
    }
  }

  // More comprehensive user check
  useEffect(() => {
    console.log('AddAddress useEffect - User:', user);
    
    if (!user) {
      console.log('No user found, redirecting to login');
      toast.error('Please login to add address');
      navigate('/login');
      return;
    }

    if (!user._id) {
      console.log('User exists but no _id, redirecting to login');
      toast.error('Invalid user session. Please login again.');
      navigate('/login');
      return;
    }
  }, [user, navigate])

  // Show loading if user is being checked
  if (!user) {
    return (
      <div className='mt-16 pb-16 flex justify-center items-center'>
        <p className='text-gray-500'>Loading...</p>
      </div>
    );
  }

  return (
    <div className='mt-16 pb-16'>
      <p className='text-2xl md:text-3xl text-gray-500'>Add Shipping <span className='font-semibold text-green-500'>Address</span></p>
      <div className='flex flex-col-reverse md:flex-row justify-between mt-10'>
        <div className='flex-1 max-w-md'> 
          <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>
            <div className='grid grid-cols-2 gap-4'>
              <InputField handleChange={handleChange} address={address} name='firstName' type="text" placeholder="First Name"/>
              <InputField handleChange={handleChange} address={address} name='lastName' type="text" placeholder="Last Name"/>
            </div>

            <InputField handleChange={handleChange} address={address} name='email' type="email" placeholder="Email Address" />
            
            <InputField handleChange={handleChange} address={address} name='street' type="text" placeholder="Street" />

            <div className='grid grid-cols-2 gap-4'>
              <InputField handleChange={handleChange} address={address} name='city' type="text" placeholder="City" />
              <InputField handleChange={handleChange} address={address} name='state' type="text" placeholder="State" />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <InputField handleChange={handleChange} address={address} name='zipcode' type="number" placeholder="Zipcode" />
              <InputField handleChange={handleChange} address={address} name='country' type="text" placeholder="Country" />
            </div>
            
            <InputField handleChange={handleChange} address={address} name='phone' type="text" placeholder="Phone" />

            <button className='w-full mt-6 bg-green-400 text-white py-3 hover:bg-green-500 transition cursor-pointer uppercase'>
              Save Address
            </button>
          </form> 
        </div>
        <img className='md:mr-16 mb-16 md:mt-0' src={assets.add_address_image} alt="Add Address" />
      </div>
    </div>
  )
}

export default AddAddress