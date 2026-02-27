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
      isCompleted: true,
    };

    exercise.sets.push(newSet);

    await session.save();

    return res.status(200).json(session);
  } catch (error) {
    console.error("Error creating set:", error);
    return res.status(500).json({ message: "Error creating set" });
  }
};
