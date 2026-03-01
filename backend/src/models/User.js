import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    // optional later
    displayName: { type: String, trim: true, maxlength: 50 },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
