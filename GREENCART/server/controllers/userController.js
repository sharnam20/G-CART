import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) { // fixed condition
      return res.json({ success: false, message: "Missing Details" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.json({ success: false, message: "User already exists" }); // fixed typo

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // corrected cookie duration in ms
    });

    return res.json({ success: true, user: { email: user.email, name: user.name } });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


// Login user : api/user/login

export const login = async(req,res) =>{
  try{
    const {email,password} =req.body;
    if(!email || !password)
      return res.json({success:false,message:'email and password are required'});
    const user = await User.findOne({email});

    if(!user){
          return res.json({success:false,message:'Invalied email or Password'});
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch)
         return res.json({success:false,message:'Invalied email or Password'});

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // corrected cookie duration in ms
    });

    return res.json({ success: true, user: { email: user.email, name: user.name } });


  }
    catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

// check Auth: /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    const userId = req.userId; // ✅ Get ID from req.userId (set in middleware)
    const user = await User.findById(userId).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// logout user: /api/user/logout
export const logout = async (req,res)=>{
  try{
    res.clearCookie('token',{
      httpOnly:true,
      secure:process.env.NODE_ENV === 'production',
      sameSite:process.env.NODE_ENV === 'production' ? 'none': 'strict',
    });
    return res.json({success:true,message:"Logged Out"})
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}
