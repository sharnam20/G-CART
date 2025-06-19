import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" }, // ✅ ADD THIS FIELD
  cartItems: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { minimize: false });

// ✅ FIXED: Use consistent capitalization - 'User' instead of 'user'
const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;