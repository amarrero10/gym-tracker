import Plan from "../models/Plan.js";
import Exercise from "../models/Exercise.js";

export const getAllPlans = async (req, res) => {
  try {
    const exercises = await Plan.find().sort({ name: "asc" });
    res.status(200).json(exercises);
  } catch (error) {
    console.error("Error getting plans: ", error);
  }
};

export const createPlan = async (req, res) => {
  try {
    const { name, weeksCount, daysPerWeek, weeks } = req.body;

    const newPlan = new Plan({
      name,
      weeksCount,
      daysPerWeek,
      weeks,
    });

    await newPlan.save();

    res.status(201).json({ message: "Plan created!" });
  } catch (error) {
    console.error("Problem getting results: ", error);
    res.status(500).json({ message: "Error creating plan" });
  }
};

export const getPlan = async (req, res) => {
  try {
    const planId = req.params.id;

    const plan = await Plan.findById(planId).populate({
      path: "weeks.days.exercises.exerciseId",
      model: "Exercise",
    });

    if (!plan) {
      console.log("No plan with that id");
      return null;
    }

    res.status(200).json(plan);
  } catch (error) {
    console.error("Error fetching plan: ", error);
    throw error;
  }
};
