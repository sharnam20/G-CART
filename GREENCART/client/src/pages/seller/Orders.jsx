import React, { useEffect, useState } from 'react'
import { useAppcontext } from '../../context/Appcontext'
import { assets, dummyOrders } from '../../assets/assets'
import toast from 'react-hot-toast'
import axios from 'axios'

const Orders = () => {

  const { currency } = useAppcontext()
  const [orders, setOrders] = useState([])

  // ✅ ADD THESE DEBUGGING LINES TO YOUR EXISTING Orders.jsx

// In your fetchOrder function, add these console.logs:
const fetchOrder = async () => {
  try{
    const token = localStorage.getItem('token');
    
    const {data} = await axios.get('/api/order/seller-1', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('API Response:', data);

    if(data.success){
      const fetchedOrders = data.orders || [];
      
      // ✅ ADD DETAILED DEBUGGING FOR EACH ORDER
      console.log('=== ORDER DEBUGGING ===');
      console.log('Total orders:', fetchedOrders.length);
      
      fetchedOrders.forEach((order, index) => {
        console.log(`\n--- Order ${index + 1} ---`);
        console.log('Order ID:', order._id);
        console.log('Payment Type:', order.paymentType);
        console.log('Status:', order.status);
        console.log('Amount:', order.amount);
        console.log('Address Object:', order.address);
        console.log('Address exists:', !!order.address);
        
        if (order.address) {
          console.log('Address Details:');
          console.log('- firstName:', order.address.firstName);
          console.log('- lastName:', order.address.lastName);
          console.log('- street:', order.address.street);
          console.log('- city:', order.address.city);
          console.log('- state:', order.address.state);
          console.log('- country:', order.address.country);
          console.log('- phone:', order.address.phone);
          console.log('- zipcode:', order.address.zipcode);
        } else {
          console.log('❌ NO ADDRESS FOUND FOR THIS ORDER');
        }
        
        // ✅ Check if it's an online payment order specifically
        if (order.paymentType === 'Online' || order.paymentType === 'Stripe' || order.paymentType === 'Razorpay') {
          console.log('🔍 ONLINE PAYMENT ORDER - Address should be present!');
          if (!order.address || !order.address.firstName) {
            console.log('🚨 PROBLEM: Online order missing address!');
          }
        }
      });
      
      setOrders(fetchedOrders);
      toast.success(`Loaded ${fetchedOrders.length} orders`);
    }
  }catch(error){
    // ... rest of your error handling
  }
};

  useEffect(() => {
    fetchOrder();
  }, [])

  return (
    <div className='no scrollbar flex-1 h-[95vh] overflow-y-scroll'>
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg font-medium">Orders List</h2>
        
        {/* Debug info - remove after testing
        <div className="bg-gray-100 p-2 rounded text-sm">
          <p>Debug Info:</p>
          <p>Orders count: {orders.length}</p>
          <p>Token exists: {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
        </div> */}

        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          orders.map((order, index) => (
            <div key={index} className="flex flex-col md:items-center md:flex-row justify-between gap-5 p-5 max-w-4xl rounded-md border border-gray-300">
              <div className="flex gap-5 max-w-80">
                <img className="w-12 h-12 object-cover" src={assets.box_icon} alt="boxIcon" />
                <div>
                  {order.items && order.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex flex-col">
                      <p className="font-medium">
                        {item.product?.name || 'Unknown Product'}{" "}
                        <span className="text-green">x {item.quantity || 1}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-sm md:text-base text-black/60">
                <p className='text-black/80'>
                  {order.address?.firstName || 'N/A'} {order.address?.lastName || ''}</p>
                <p>{order.address?.street || 'N/A'}, {order.address?.city || 'N/A'}</p>
                <p>{order.address?.state || 'N/A'}, {order.address?.zipcode || 'N/A'}, {order.address?.country || 'N/A'}</p>
                <p>{order.address?.phone || 'N/A'}</p>
              </div>

              <p className="font-medium text-lg my-auto">{currency}{order.amount || 0}</p>

              <div className="flex flex-col text-sm md:text-base text-black/60">
                <p>Method: {order.paymentType || 'N/A'}</p>
                <p>Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Orders