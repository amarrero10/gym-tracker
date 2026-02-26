import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 6000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB Connected Successfully!");

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error: ", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MonoDB disconnected....");
    });
  } catch (error) {
    console.error("Failed to connect: ", error.message);
    process.exit(1);
  }
};
