import mongoose from "mongoose";

const sessionSetsSchema = new mongoose.Schema({
  setNumber: {
    type: Number,
    required: true,
  },
  reps: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
  },
  isCompleted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const sessionExerciseSchema = new mongoose.Schema({
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
  sets: [sessionSetsSchema],
});

const workoutSessionSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    weekId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    dayId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    dayNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "in_progress",
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    exercises: [sessionExerciseSchema],
  },
  { timestamps: true },
);

const Session = mongoose.model("Session", workoutSessionSchema);

export default Session;
