import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // ⏳ Timeout if Mongo isn't available
    });

    mongoose.connection.on("connected", () =>
      console.log("✅ MongoDB connected")
    );
    mongoose.connection.on("error", (err) =>
      console.error("❌ MongoDB connection error:", err)
    );
  } catch (error) {
    console.error("❌ Initial DB connection failed:", error.message);
    setTimeout(connectDB, 5000); // 🔁 Retry connection after 5s
  }
};

export default connectDB;
