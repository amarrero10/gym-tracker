import Plan from "../models/Plan.js";
import Session from "../models/Session.js";
import mongoose from "mongoose";

export const getAllPlans = async (req, res) => {
  const { userId } = req.user;

  try {
    const plans = await Plan.find({ userId }).sort({ name: "asc" });
    res.status(200).json(plans);
  } catch (error) {
    console.error("Error getting plans: ", error);
  }
};

export const createPlan = async (req, res) => {
  try {
    const { name, weeksCount, daysPerWeek, weeks } = req.body;
    const { userId } = req.user;

    const newPlan = new Plan({
      name,
      weeksCount,
      daysPerWeek,
      weeks,
      userId,
    });

    await newPlan.save();

    res.status(201).json({ newPlan });
  } catch (error) {
    console.error("Problem getting results: ", error);
    res.status(500).json({ message: "Error creating plan" });
  }
};

export const getPlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const { userId } = req.user;

    const plan = await Plan.findOne({ _id: planId, userId }).populate({
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
    const { userId } = req.user;

    const updateData = req.body;

    const plan = await Plan.updateOne({ _id: id, userId }, updateData, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json({ updatedPlan: plan });
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
    const { userId } = req.user;

    console.log(id, userId);

    const plan = await Plan.findByIdAndDelete(id);

    console.log(plan);

    if (plan.deletedCount === 1) {
      res
        .status(200)
        .json({ message: `Plan has been deleted: ${plan.deletedCount} ` });
    } else {
      res.status(400).json({ message: "Error deleting Plan" });
    }
  } catch (error) {
    console.error("Problem getting results, ", error);
  }
};

export const getProgress = async (req, res) => {
  try {
    const { planId } = req.params;
    const { userId } = req.user;

    console.log(planId);

    if (!planId) {
      return res.status(400).json({ message: "planId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ message: "Invalid planId" });
    }

    const progress = {};

    const plan = await Plan.findOne({ _id: planId, userId });

    if (!plan) {
      return res.status(404).json({ message: "plan not found" });
    }

    const completedCount = await Session.countDocuments({
      planId,
      userId,
      status: "completed",
    });

    const result = await Session.find(
      { planId, status: "completed", userId },
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
