import Plan from "../models/Plan.js";

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
      res.status(404).json({ message: "No plan with that id." });
    }

    res.status(200).json(plan);
  } catch (error) {
    console.error("Error fetching plan: ", error);
    res.status(500).json({ message: "Error finding plan" });
  }
};

export const editplan = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = req.body;

    const plan = await Plan.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json(plan);
  } catch (error) {
    res.status(400).json({ message: error });
    console.error(error);
  }
};

// LOGIC TO UPDATE NESTED SUB DOCUMENT:

// {
//   "$set": {
//     "weeks.0.days.0.title": "5 day work out plan"
//   }
// }

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findByIdAndDelete(id);

    if (!plan) {
      res.status(404).json({ message: "Error finding plan with that id" });
    }

    res.status(201).json({ message: "Plan has been deleted." });
  } catch (error) {
    console.error("Problem getting results, ", error);
  }
};
