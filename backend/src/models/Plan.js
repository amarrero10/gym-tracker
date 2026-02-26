import mongoose from "mongoose";

const planExerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exercise",
    required: true,
  },
  orderIndex: {
    type: Number,
    required: true,
  },
  targetSets: {
    type: Number,
    required: true,
  },
  targetRepsMin: {
    type: Number,
    required: true,
  },
  targetRepsMax: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value >= this.targetRepsMin;
      },
      message: "Max rep must be greater than or equal to min rep",
    },
  },
  restSeconds: {
    type: Number,
  },
  notes: {
    type: String,
  },
});

const planDaysSchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  exercises: [planExerciseSchema],
});

const planWeeksSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: true,
  },
  days: [planDaysSchema],
});

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 50,
      lowercase: true,
      trim: true,
      index: true,
    },
    weeksCount: {
      type: Number,
      required: true,
    },
    daysPerWeek: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
    },
    weeks: [planWeeksSchema],
  },
  {
    timestamps: true,
  },
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
