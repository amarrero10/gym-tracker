import mongoose from "mongoose";
import Session from "../models/Session.js";
import Plan from "../models/Plan.js";
import Exercise from "../models/Exercise.js";

export const createSession = async (req, res) => {
  try {
    const { planId, weekNumber, dayNumber } = req.body;

    // 1) Basic validation
    if (!planId || weekNumber == null || dayNumber == null) {
      return res.status(400).json({
        message: "planId, weekNumber, and dayNumber are required",
      });
    }

    const weekNum = Number(weekNumber);
    const dayNum = Number(dayNumber);

    if (Number.isNaN(weekNum) || Number.isNaN(dayNum)) {
      return res
        .status(400)
        .json({ message: "weekNumber/dayNumber must be numbers" });
    }

    // 2) Load plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // 3) Find week by weekNumber
    const week = plan.weeks.find((w) => w.weekNumber === weekNum);
    if (!week) {
      return res
        .status(404)
        .json({ message: `Week ${weekNum} not found in plan` });
    }

    // 4) Find day by dayNumber inside that week
    const day = week.days.find((d) => d.dayNumber === dayNum);
    if (!day) {
      return res
        .status(404)
        .json({ message: `Day ${dayNum} not found in week ${weekNum}` });
    }

    const weekId = week._id;
    const dayId = day._id;

    // 5) Prevent duplicate in-progress sessions for same plan/week/day
    const existing = await Session.findOne({
      planId,
      weekNumber: weekNum,
      dayNumber: dayNum,
      status: "in_progress",
    });

    // Option: return existing session so user can resume
    if (existing) {
      return res.status(200).json(existing);
      // If you prefer 409 instead, swap the line above for:
      // return res.status(409).json({ message: "Session already in progress", sessionId: existing._id });
    }

    // 6) Snapshot exercises from plan day into session format
    const sessionExercises = (day.exercises || [])
      .slice()
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
      .map((ex) => ({
        exerciseId: ex.exerciseId,
        orderIndex: ex.orderIndex,
        targetSets: ex.targetSets,
        targetRepsMin: ex.targetRepsMin,
        targetRepsMax: ex.targetRepsMax,
        restSeconds: ex.restSeconds,
        notes: ex.notes,
        sets: [], // actual logged sets will be added as you lift
      }));

    // 7) Create session
    const session = await Session.create({
      planId,
      weekId,
      dayId,
      weekNumber: weekNum,
      dayNumber: dayNum,
      status: "in_progress",
      startedAt: new Date(),
      exercises: sessionExercises,
    });

    // 8) Return created session
    return res.status(201).json(session);
  } catch (error) {
    console.error("Error creating session:", error);
    return res.status(500).json({ message: "Error creating session" });
  }
};

// Add set to session
export const addSet = async (req, res) => {
  try {
    const { reps, weight, notes, isCompleted } = req.body;
    const { sessionId, sessionExerciseId } = req.params;

    const session = await Session.findById(sessionId);

    const exercise = session.exercises.id(sessionExerciseId);
    const setNumber = exercise.sets.length + 1;

    const newSet = {
      setNumber,
      reps,
      weight,
      //   Optional notes
      ...(notes ? { notes } : {}),
      isCompleted: isCompleted ?? false,
    };

    exercise.sets.push(newSet);

    await session.save();

    return res.status(200).json(session);
  } catch (error) {
    console.error("Error creating set:", error);
    return res.status(500).json({ message: "Error creating set" });
  }
};

export const editSet = async (req, res) => {
  try {
    const { reps, weight, notes, isCompleted } = req.body;
    const { sessionId, sessionExerciseId, setId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: `${sessionId} not found` });
    }

    const exercise = session.exercises.id(sessionExerciseId);

    if (!exercise) {
      return res
        .status(404)
        .json({ message: ` ${sessionExerciseId} not found in session` });
    }

    const set = exercise.sets.id(setId);

    if (!set) {
      return res
        .status(404)
        .json({ message: `${setId} not found in exercise` });
    }

    if (reps !== undefined) {
      set.reps = reps;
    }

    if (weight !== undefined) {
      set.weight = weight;
    }

    if (notes !== undefined) {
      set.notes = notes;
    }

    if (typeof isCompleted === "boolean") {
      set.isCompleted = isCompleted;
    }

    await session.save();

    return res.status(200).json(session);
  } catch (error) {
    console.error("Error editing set:", error);
    return res.status(500).json({ message: "Error editing set" });
  }
};

export const finishSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: ` ${sessionId} not found.` });
    }

    if (session.status === "completed") {
      return res
        .status(200)
        .json({ message: "Session already completed.", session });
    } else {
      session.status = "completed";
      session.completedAt = new Date();
    }

    await session.save();

    return res.status(200).json(session);
  } catch (error) {
    console.error("Error finishing session:", error);
    return res.status(500).json({ message: "Error finishing session" });
  }
};

export const getInProgressSession = async (req, res) => {
  try {
    const { planId } = req.query;

    // 1) Validate input
    if (!planId) {
      return res.status(400).json({ message: "planId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ message: "Invalid planId" });
    }

    // 2) Find newest in-progress session for this plan
    const session = await Session.findOne({
      planId,
      status: "in_progress",
    }).sort({ startedAt: "asc", createdAt: "asc" });

    // 3) Return session or null (simplest for frontend)
    return res.status(200).json({ session: session ?? null });
  } catch (error) {
    console.error("Error fetching in-progress session:", error);
    return res
      .status(500)
      .json({ message: "Error fetching in-progress session" });
  }
};
