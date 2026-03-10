import mongoose from "mongoose";

const weightEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ["lbs", "kg"],
      default: "lbs",
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const WeightEntry = mongoose.model("WeightEntry", weightEntrySchema);

export default WeightEntry;
