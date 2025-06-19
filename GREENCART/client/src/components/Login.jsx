import React from 'react'
import { useAppcontext } from '../context/Appcontext';
import toast from 'react-hot-toast';

const Login = () => {

const { setShowUserLogin, setuser, axios, navigate, fetchUser } = useAppcontext(); // Added fetchUser
  const [state, setState] = React.useState("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [forgotPassword, setForgotPassword] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState("");

  const onSubmitHandler = async(event)=>{
    try{
      
      event.preventDefault();
       const{ data } =await axios.post(`/api/user/${state}`,{name,email,password});
       if(data.success){
             // ✅ Call fetchUser to refresh user data from server
             await fetchUser();
             
             navigate('/')
             setShowUserLogin(false)
             toast.success(state === 'login' ? 'Logged in successfully!' : 'Account created successfully!');
       }else{
        toast.error(data.message)
       }

    }catch(error){
      toast.error(error.message || 'An error occurred')
    }
  
  }

  return (
    <div onClick={()=> setShowUserLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center text-sm text-gray-600 bg-black/50'>
      <form onSubmit={onSubmitHandler} onClick={(e)=>e.stopPropagation()} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white">
        <p className="text-2xl font-medium m-auto">
          {forgotPassword ? (
            <span className="text-green-500">Reset Password</span>
          ) : (
            <><span className="text-green-500">User</span> {state === "login" ? "Login" : "Sign Up"}</>
          )}
        </p>

        {forgotPassword ? (
          <>
            <div className="w-full">
              <p>Email</p>
              <input
                onChange={(e) => setResetEmail(e.target.value)}
                value={resetEmail}
                placeholder="Enter your email"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-green-500"
                type="email"
                required
              />
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                alert("Password reset link sent to " + resetEmail); // simulate reset
              }}
              className="bg-green-500 hover:bg-green-600 transition-all text-white w-full py-2 rounded-md cursor-pointer"
            >
              Send Reset Link
            </button>
            <p onClick={() => setForgotPassword(false)} className="text-green-500 cursor-pointer text-center w-full">Back to Login</p>
          </>
        ) : (
          <>
            {state === "register" && (
              <div className="w-full">
                <p>Name</p>
                <input onChange={(e) => setName(e.target.value)} value={name} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-green-500" type="text" required />
              </div>
            )}
            <div className="w-full ">
              <p>Email</p>
              <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-green-500" type="email" required />
            </div>
            <div className="w-full ">
              <p>Password</p>
              <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-green-500" type="password" required />
              {state === "login" && (
                <p onClick={() => setForgotPassword(true)} className="text-green-500 mt-1 cursor-pointer text-sm">Forgot Password?</p>
              )}
            </div>
            {state === "register" ? (
              <p>
                Already have account? <span onClick={() => setState("login")} className="text-green-500 cursor-pointer">click here</span>
              </p>
            ) : (
              <p>
                Create an account? <span onClick={() => setState("register")} className="text-green-500 cursor-pointer">click here</span>
              </p>
            )}
            <button className="bg-green-500 hover:bg-green-600 transition-all text-white w-full py-2 rounded-md cursor-pointer">
              {state === "register" ? "Create Account" : "Login"}
            </button>
          </>
        )}
      </form>
    </div>
  )
}

export default Login