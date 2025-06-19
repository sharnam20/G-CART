import React, { useEffect, useState } from 'react'
import { useAppcontext } from '../context/Appcontext'

const MyOrder = () => {
  const [myOrders, setMyOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const {currency, axios, user} = useAppcontext()

  const fetchMyOrders = async() => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Starting to fetch orders...');
      console.log('User object:', user);
      
      const {data} = await axios.get('/api/order/user')
      console.log('Full API Response:', data);
      
      if (data.success && data.orders) { 
        // Filter out orders with empty or invalid items
        const validOrders = data.orders.filter(order => {
          return order.items && Array.isArray(order.items) && order.items.length > 0;
        });
        
        console.log(`Received ${data.orders.length} orders, ${validOrders.length} valid orders`);
        setMyOrders(validOrders)
      } else {
        console.log('API returned success: false or no orders array');
        setMyOrders([])
      }
    } catch (error) {
      console.log('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to fetch orders')
      setMyOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Optional: Cleanup empty orders
  const cleanupEmptyOrders = async () => {
    try {
      const {data} = await axios.delete('/api/order/cleanup')
      if (data.success) {
        console.log('Cleanup successful:', data.message)
        fetchMyOrders() // Refresh the orders list
      }
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  }

  useEffect(() => {
    console.log('MyOrder useEffect triggered');
    console.log('User state:', user);
    
    if (user) {
      console.log('User exists, fetching orders...');
      fetchMyOrders()
    } else {
      console.log('No user found, not fetching orders');
      setMyOrders([])
    }
  }, [user])

  // Enhanced debugging
  console.log('=== MyOrder Render Debug ===');
  console.log('Current myOrders state:', myOrders);
  console.log('myOrders length:', myOrders.length);
  console.log('User:', user);
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('===========================');

  if (loading) {
    return (
      <div className='mt-6 pb-16'>
        <div className='flex flex-col items-end w-max mb-8'> 
          <p className='text-2xl font-medium uppercase'>My Orders</p>
          <div className='w-16 h-0.5 bg-green-400 rounded-full'></div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='mt-6 pb-16'>
      <div className='flex flex-col items-start w-max mb-8'> 
         <p className='text-2xl font-medium uppercase text-gray-800'>My Orders</p>
         <div className='w-16 h-0.5 bg-green-400 rounded-full'></div>
      </div>
      
      {/* Show error if any */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
        </div>
      )}
      
      {!user && (
        <div className="text-center py-8">
          <p className="text-gray-500">Please log in to view your orders</p>
        </div>
      )}
      
      {user && myOrders.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No orders found</p>
          <button 
            onClick={fetchMyOrders}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Retry Fetch Orders
          </button>
        </div>
      )}
      
      {myOrders.map((order, index) => {
        // Additional safety check
        if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
          return null;
        }
        
        return (
          <div key={order._id || index} className='border border-gray-200 rounded-lg mb-6 p-0 max-w-4xl bg-white shadow-sm'>
            <div className='flex justify-between items-center text-gray-600 text-sm font-medium p-4 bg-gray-50 rounded-t-lg'>
              <span>OrderId: {order._id}</span>
              <span>Payment: {order.paymentType}</span>
              <span>Total Amount: {currency}{order.amount?.toFixed(0) || '0'}</span>
            </div>
            
            {order.items.map((item, itemIndex) => {
              // Safety check for item structure
              if (!item || !item.product) {
                return null;
              }
              
              return (
                <div key={itemIndex} className='flex items-center justify-between p-6 bg-white'>
                  <div className='flex items-center'>
                    <div className='bg-orange-100 p-3 rounded-lg mr-4'>
                      <img 
                        src={item.product.image?.[0] || '/placeholder.png'} 
                        alt={item.product.name || 'Product'} 
                        className='w-12 h-12 object-cover'
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className='text-lg font-medium text-gray-800 mb-1'>
                        {item.product.name || 'Product Name'}
                      </h3>
                      <p className='text-sm text-gray-500'>Category: {item.product.category || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  <div className='text-right'>
                    <div className='text-sm text-gray-600 mb-1'>
                      <p>Quantity: {item.quantity || "1"}</p>
                      <p>Status: {item.status || "Order Placed"}</p>
                      <p>Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Date not available'}</p>
                    </div>
                  </div>
                  
                  <div className='text-right'>
                    <p className='text-green-500 text-lg font-semibold'> 
                      Amount: {currency}{(item.product.offerPrice * (item.quantity || 1)).toFixed(0)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  )
}

export default MyOrder