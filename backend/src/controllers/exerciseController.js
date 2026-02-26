import Exercise from "../models/Exercise.js";

export const getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.status(200).json(exercises);
  } catch (error) {
    console.error("Problem getting results: ", error);
    res.status(500).json({ message: "Error fetching exercises" });
  }
};

export const createExercise = async (req, res) => {
  try {
    const { name, muscleGroup, movementPattern, equipment } = req.body;
    const newExercise = new Exercise({
      name,
      muscleGroup,
      movementPattern,
      equipment,
    });

    await newExercise.save();

    res.status(201).json({ message: "Exercise created!" });
    console.log(name, movementPattern);
  } catch (error) {
    console.error("Problem getting results: ", error);
    res.status(500).json({ message: "Error creating exercise" });
  }
};
