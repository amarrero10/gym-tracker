import Exercise from "../models/Exercise.js";

export const getAllExercises = async (req, res) => {
  try {
    const { movementPattern, muscleGroup, equipment } = req.query;
    const queryObj = {};
    if (movementPattern) {
      queryObj.movementPattern = movementPattern;
    }

    if (muscleGroup) {
      queryObj.muscleGroup = muscleGroup;
    }

    if (equipment) {
      queryObj.equipment = equipment;
    }

    if (Object.keys(queryObj).length > 0) {
      const queryEx = await Exercise.find(queryObj).sort({ name: "asc" });
      res.status(200).json(queryEx);
    } else {
      const exercises = await Exercise.find().sort({ name: "asc" });
      res.status(200).json(exercises);
    }
  } catch (error) {
    console.error("Problem getting results: ", error);
    res.status(500).json({ message: "Error fetching exercises" });
  }
};

export const getExercise = async (req, res) => {
  try {
    const exerciseId = req.params.id;

    const exercise = await Exercise.findById(exerciseId);

    if (!exercise) {
      console.log("No exercise with that id");
      return null;
    }

    console.log("Exercise found: ", exercise);

    res.status(200).json(exercise);
  } catch (error) {
    console.error("Error fetching user: ", error);
    throw error;
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

// PUT needs everything from document.
export const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await Exercise.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteEx = await Exercise.findByIdAndDelete(id);
    if (!deleteEx) {
      res.status(404).json({ message: "Error finding exercise" });
    }

    res.status(200).json({ message: "Exercise deleted." });
  } catch (error) {
    console.error("Problem getting results, ", error);
  }
};
