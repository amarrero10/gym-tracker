import mongoose from "mongoose";

// 1. Create Schema

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 50,
      lowercase: true,
      trim: true,
      index: true,
      unique: true,
    },
    muscleGroup: {
      type: String,
      required: true,
      maxlength: 50,
      lowercase: true,
      trim: true,
    },
    movementPattern: {
      type: String,
      required: true,
      maxlength: 50,
      lowercase: true,
      trim: true,
    },
    equipment: {
      type: String,
      required: true,
      maxlength: 50,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true },
);

// 2. Create model based off schema

const Exercise = mongoose.model("Exercise", exerciseSchema);

// 3. Export model

export default Exercise;
