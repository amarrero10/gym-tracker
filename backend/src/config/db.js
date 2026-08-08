import mongoose from "mongoose";

// Cached on `global` so warm serverless invocations reuse the same
// connection instead of opening a new one per request.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 6000,
        socketTimeoutMS: 45000,
      })
      .then((conn) => {
        console.log("MongoDB Connected Successfully!");

        mongoose.connection.on("error", (err) => {
          console.error("MongoDB connection error: ", err);
        });

        mongoose.connection.on("disconnected", () => {
          console.warn("MongoDB disconnected....");
        });

        return conn;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
