import Plan from "../models/Plan.js";
import Session from "../models/Session.js";
import mongoose from "mongoose";

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

export const getProgress = async (req, res) => {
  try {
    const { planId } = req.params;

    console.log(planId);

    if (!planId) {
      return res.status(400).json({ message: "planId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ message: "Invalid planId" });
    }

    const progress = {};

    const plan = await Plan.findById(planId);

    if (!plan) {
      return res.status(404).json({ message: "plan not found" });
    }

    const completedCount = await Session.countDocuments({
      planId,
      status: "completed",
    });

    const result = await Session.find(
      { planId, status: "completed" },
      {
        weekNumber: 1,
        dayNumber: 1,
        completedAt: 1,
      },
    )
      .sort({
        completedAt: "desc",
      })
      .limit(1);

    const lastCompletedSession = result[0] || null;

    const totalDays = plan.weeksCount * plan.daysPerWeek;

    const completePercent =
      totalDays === 0 ? 0 : Math.round((completedCount / totalDays) * 100);

    if (!lastCompletedSession) {
      progress.nextUp = { weekNumber: 1, dayNumber: 1 };
    } else if (lastCompletedSession.dayNumber < plan.daysPerWeek) {
      progress.nextUp = {
        weekNumber: lastCompletedSession.weekNumber,
        dayNumber: lastCompletedSession.dayNumber + 1,
      };
    } else {
      progress.nextUp = {
        weekNumber: lastCompletedSession.weekNumber + 1,
        dayNumber: 1,
      };
    }

    if (
      progress.nextUp !== null &&
      progress.nextUp.weekNumber > plan.weeksCount
    ) {
      progress.nextUp = null;
      progress.isComplete = true;
    }

    progress.planId = planId;
    progress.totalDays = totalDays;
    progress.completedCount = completedCount;
    progress.completedPercent = completePercent;
    progress.lastCompleted = lastCompletedSession;

    res.status(200).json(progress);
  } catch (error) {
    console.error("Error fetching current progress:", error);
    return res.status(500).json({ message: "Error fetching current progress" });
  }
};
